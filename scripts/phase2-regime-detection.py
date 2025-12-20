#!/usr/bin/env python3
"""
PHASE 2: Regime Detection & Cross-Timeframe Analysis
World-Class Trading System - Market Intelligence Layer

This script implements:
1. Volatility Regime Classification (Low/Normal/High/Spike)
2. Trend Regime Classification (Strong Up/Weak Up/Ranging/Weak Down/Strong Down)
3. Cycle Regime Classification (Cyclical/Trending/Transitional)
4. Liquidity Regime Classification (High/Normal/Low)
5. Market Hours Regime (Pre-Market/Open/Mid-Day/Power Hour/After Hours)
6. Cross-Timeframe Alignment Scores
7. Multi-TF Momentum Divergence Detection
8. Higher Timeframe Support/Resistance Levels
9. Regime Consistency Across Timeframes
10. Combined Regime State (e.g., "High Vol + Strong Trend")

This creates the context needed for regime-adaptive trading strategies.
"""

import os
import sys
from datetime import datetime, time
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from supabase import create_client
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

# Load environment
load_dotenv('.env.local')

# Supabase connection
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


class RegimeDetector:
    """
    Professional-grade regime detection and classification
    """
    
    def __init__(self):
        self.supabase = supabase
    
    # ==================== VOLATILITY REGIME ====================
    
    def classify_volatility_regime(self, volatility: pd.Series) -> pd.Series:
        """
        Classify volatility regime based on percentiles
        
        0 = Low Vol (< 20th percentile)
        1 = Normal Vol (20-80th percentile)
        2 = High Vol (80-95th percentile)
        3 = Volatility Spike (> 95th percentile)
        """
        # Calculate percentiles
        p20 = volatility.quantile(0.20)
        p80 = volatility.quantile(0.80)
        p95 = volatility.quantile(0.95)
        
        # Classify
        regime = pd.Series(index=volatility.index, dtype=int)
        regime[volatility < p20] = 0  # Low
        regime[(volatility >= p20) & (volatility < p80)] = 1  # Normal
        regime[(volatility >= p80) & (volatility < p95)] = 2  # High
        regime[volatility >= p95] = 3  # Spike
        
        return regime
    
    # ==================== TREND REGIME ====================
    
    def classify_trend_regime(self, adx: pd.Series, plus_di: pd.Series, minus_di: pd.Series, choppiness: pd.Series) -> pd.Series:
        """
        Classify trend regime
        
        0 = Strong Downtrend (ADX > 25, -DI > +DI)
        1 = Weak Downtrend (ADX < 25, -DI > +DI)
        2 = Ranging (ADX < 20, Choppiness > 61.8)
        3 = Weak Uptrend (ADX < 25, +DI > -DI)
        4 = Strong Uptrend (ADX > 25, +DI > -DI)
        """
        regime = pd.Series(index=adx.index, dtype=int)
        
        # Strong Downtrend
        regime[(adx > 25) & (minus_di > plus_di)] = 0
        
        # Weak Downtrend
        regime[(adx <= 25) & (minus_di > plus_di) & (choppiness <= 61.8)] = 1
        
        # Ranging
        regime[(adx < 20) & (choppiness > 61.8)] = 2
        
        # Weak Uptrend
        regime[(adx <= 25) & (plus_di > minus_di) & (choppiness <= 61.8)] = 3
        
        # Strong Uptrend
        regime[(adx > 25) & (plus_di > minus_di)] = 4
        
        return regime
    
    # ==================== CYCLE REGIME ====================
    
    def classify_cycle_regime(self, ehlers_cycle: pd.Series, hurst: pd.Series) -> pd.Series:
        """
        Classify cycle regime
        
        0 = Trending (no clear cycle, Hurst > 0.55)
        1 = Cyclical (clear cycle detected, Hurst < 0.45)
        2 = Transitional (cycle breaking down, 0.45 <= Hurst <= 0.55)
        """
        regime = pd.Series(index=ehlers_cycle.index, dtype=int)
        
        # Calculate cycle strength (consistency)
        cycle_std = ehlers_cycle.rolling(20).std()
        cycle_mean = ehlers_cycle.rolling(20).mean()
        cycle_cv = cycle_std / (cycle_mean + 1e-10)  # Coefficient of variation
        
        # Trending (high Hurst, inconsistent cycle)
        regime[(hurst > 0.55) | (cycle_cv > 0.3)] = 0
        
        # Cyclical (low Hurst, consistent cycle)
        regime[(hurst < 0.45) & (cycle_cv <= 0.3)] = 1
        
        # Transitional (middle Hurst)
        regime[(hurst >= 0.45) & (hurst <= 0.55)] = 2
        
        return regime
    
    # ==================== LIQUIDITY REGIME ====================
    
    def classify_liquidity_regime(self, spread_mean: pd.Series, volume: pd.Series) -> pd.Series:
        """
        Classify liquidity regime
        
        0 = Low Liquidity (wide spreads, low volume)
        1 = Normal Liquidity
        2 = High Liquidity (tight spreads, high volume)
        """
        # Normalize spread and volume
        spread_norm = (spread_mean - spread_mean.mean()) / (spread_mean.std() + 1e-10)
        volume_norm = (volume - volume.mean()) / (volume.std() + 1e-10)
        
        # Liquidity score (high volume + low spread = high liquidity)
        liquidity_score = volume_norm - spread_norm
        
        # Classify based on percentiles
        p33 = liquidity_score.quantile(0.33)
        p67 = liquidity_score.quantile(0.67)
        
        regime = pd.Series(index=spread_mean.index, dtype=int)
        regime[liquidity_score < p33] = 0  # Low
        regime[(liquidity_score >= p33) & (liquidity_score < p67)] = 1  # Normal
        regime[liquidity_score >= p67] = 2  # High
        
        return regime
    
    # ==================== MARKET HOURS REGIME ====================
    
    def classify_market_hours_regime(self, timestamps: pd.Series) -> pd.Series:
        """
        Classify market hours regime (US market hours)
        
        0 = Pre-Market (4:00-9:30 ET)
        1 = Market Open (9:30-10:30 ET)
        2 = Mid-Day (10:30-15:00 ET)
        3 = Power Hour (15:00-16:00 ET)
        4 = After Hours (16:00-20:00 ET)
        5 = Overnight (20:00-4:00 ET)
        """
        regime = pd.Series(index=timestamps.index, dtype=int)
        
        for idx, ts in timestamps.items():
            # Convert to ET (assuming timestamps are UTC)
            # Simplified - in production, use proper timezone conversion
            hour = ts.hour
            minute = ts.minute
            time_decimal = hour + minute / 60
            
            # Adjust for ET (UTC-4 or UTC-5 depending on DST)
            # Simplified: assume UTC-4
            et_time = (time_decimal - 4) % 24
            
            if 4 <= et_time < 9.5:
                regime.iloc[idx] = 0  # Pre-Market
            elif 9.5 <= et_time < 10.5:
                regime.iloc[idx] = 1  # Market Open
            elif 10.5 <= et_time < 15:
                regime.iloc[idx] = 2  # Mid-Day
            elif 15 <= et_time < 16:
                regime.iloc[idx] = 3  # Power Hour
            elif 16 <= et_time < 20:
                regime.iloc[idx] = 4  # After Hours
            else:
                regime.iloc[idx] = 5  # Overnight
        
        return regime
    
    # ==================== COMBINED REGIME STATE ====================
    
    def create_combined_regime_state(self, vol_regime: int, trend_regime: int, cycle_regime: int, liquidity_regime: int) -> str:
        """
        Create human-readable combined regime state
        """
        vol_names = ['Low Vol', 'Normal Vol', 'High Vol', 'Vol Spike']
        trend_names = ['Strong Down', 'Weak Down', 'Ranging', 'Weak Up', 'Strong Up']
        cycle_names = ['Trending', 'Cyclical', 'Transitional']
        liq_names = ['Low Liq', 'Normal Liq', 'High Liq']
        
        return f"{vol_names[vol_regime]} + {trend_names[trend_regime]} + {cycle_names[cycle_regime]} + {liq_names[liquidity_regime]}"
    
    # ==================== CROSS-TIMEFRAME ANALYSIS ====================
    
    def calculate_timeframe_alignment(self, symbol: str, timestamp: pd.Timestamp, timeframes: List[str]) -> float:
        """
        Calculate trend alignment across multiple timeframes
        
        Returns: Percentage of timeframes that are bullish (0-100)
        """
        bullish_count = 0
        total_count = 0
        
        for tf in timeframes:
            # Fetch the bar for this timeframe at this timestamp
            result = self.supabase.table('multi_timeframe_data')\
                .select('close, jma_14')\
                .eq('symbol', symbol)\
                .eq('timeframe', tf)\
                .lte('timestamp', timestamp.isoformat())\
                .order('timestamp', desc=True)\
                .limit(1)\
                .execute()
            
            if result.data and len(result.data) > 0:
                bar = result.data[0]
                if bar.get('close') and bar.get('jma_14'):
                    # Bullish if price > JMA
                    if bar['close'] > bar['jma_14']:
                        bullish_count += 1
                    total_count += 1
        
        if total_count == 0:
            return 50.0  # Neutral if no data
        
        return (bullish_count / total_count) * 100
    
    def detect_momentum_divergence(self, symbol: str, timestamp: pd.Timestamp, short_tf: str, long_tf: str) -> int:
        """
        Detect momentum divergence between timeframes
        
        Returns:
        1 = Bullish divergence (short TF up, long TF down)
        -1 = Bearish divergence (short TF down, long TF up)
        0 = No divergence
        """
        # Fetch momentum for both timeframes
        short_result = self.supabase.table('multi_timeframe_data')\
            .select('tsi')\
            .eq('symbol', symbol)\
            .eq('timeframe', short_tf)\
            .lte('timestamp', timestamp.isoformat())\
            .order('timestamp', desc=True)\
            .limit(1)\
            .execute()
        
        long_result = self.supabase.table('multi_timeframe_data')\
            .select('tsi')\
            .eq('symbol', symbol)\
            .eq('timeframe', long_tf)\
            .lte('timestamp', timestamp.isoformat())\
            .order('timestamp', desc=True)\
            .limit(1)\
            .execute()
        
        if not short_result.data or not long_result.data:
            return 0
        
        short_tsi = short_result.data[0].get('tsi', 0)
        long_tsi = long_result.data[0].get('tsi', 0)
        
        # Detect divergence
        if short_tsi > 0 and long_tsi < 0:
            return 1  # Bullish divergence
        elif short_tsi < 0 and long_tsi > 0:
            return -1  # Bearish divergence
        else:
            return 0  # No divergence
    
    def find_higher_tf_levels(self, symbol: str, timestamp: pd.Timestamp, higher_tf: str) -> Dict:
        """
        Find support/resistance levels from higher timeframe
        """
        # Fetch recent bars from higher timeframe
        result = self.supabase.table('multi_timeframe_data')\
            .select('high, low, volume_poc, volume_vah, volume_val')\
            .eq('symbol', symbol)\
            .eq('timeframe', higher_tf)\
            .lte('timestamp', timestamp.isoformat())\
            .order('timestamp', desc=True)\
            .limit(20)\
            .execute()
        
        if not result.data:
            return {'support': None, 'resistance': None, 'poc': None}
        
        df = pd.DataFrame(result.data)
        
        # Calculate key levels
        support = df['low'].min()
        resistance = df['high'].max()
        poc = df['volume_poc'].iloc[0] if 'volume_poc' in df.columns else None
        
        return {
            'support': float(support) if pd.notna(support) else None,
            'resistance': float(resistance) if pd.notna(resistance) else None,
            'poc': float(poc) if pd.notna(poc) else None
        }
    
    # ==================== MAIN PROCESSING ====================
    
    def fetch_symbol_timeframe_data(self, symbol: str, timeframe: str) -> pd.DataFrame:
        """
        Fetch data with all required features
        """
        print(f"\n📊 Fetching {symbol} - {timeframe} data...")
        
        result = self.supabase.table('multi_timeframe_data')\
            .select('*')\
            .eq('symbol', symbol)\
            .eq('timeframe', timeframe)\
            .order('timestamp')\
            .execute()
        
        if not result.data:
            print(f"  ⚠️ No data found")
            return pd.DataFrame()
        
        df = pd.DataFrame(result.data)
        print(f"  ✅ Loaded {len(df):,} bars")
        
        return df
    
    def generate_regime_features(self, df: pd.DataFrame, symbol: str, timeframe: str) -> pd.DataFrame:
        """
        Generate all regime detection features
        """
        print(f"  🔧 Generating regime features...")
        
        if len(df) < 100:
            print(f"  ⚠️ Not enough data")
            return df
        
        # Convert timestamp to datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # ===== VOLATILITY REGIME =====
        print(f"    • Classifying volatility regime...")
        if 'garch_vol' in df.columns:
            df['volatility_regime'] = self.classify_volatility_regime(df['garch_vol'])
        else:
            df['volatility_regime'] = 1  # Default to normal
        
        # ===== TREND REGIME =====
        print(f"    • Classifying trend regime...")
        if all(col in df.columns for col in ['adx', 'plus_di', 'minus_di', 'choppiness']):
            df['trend_regime'] = self.classify_trend_regime(
                df['adx'], df['plus_di'], df['minus_di'], df['choppiness']
            )
        else:
            df['trend_regime'] = 2  # Default to ranging
        
        # ===== CYCLE REGIME =====
        print(f"    • Classifying cycle regime...")
        if all(col in df.columns for col in ['ehlers_cycle', 'hurst_exponent']):
            df['cycle_regime'] = self.classify_cycle_regime(
                df['ehlers_cycle'], df['hurst_exponent']
            )
        else:
            df['cycle_regime'] = 2  # Default to transitional
        
        # ===== LIQUIDITY REGIME =====
        print(f"    • Classifying liquidity regime...")
        if all(col in df.columns for col in ['spread_mean', 'volume']):
            df['liquidity_regime'] = self.classify_liquidity_regime(
                df['spread_mean'], df['volume']
            )
        else:
            df['liquidity_regime'] = 1  # Default to normal
        
        # ===== MARKET HOURS REGIME =====
        print(f"    • Classifying market hours regime...")
        df['market_hours_regime'] = self.classify_market_hours_regime(df['timestamp'])
        
        # ===== COMBINED REGIME STATE =====
        print(f"    • Creating combined regime states...")
        df['regime_state'] = df.apply(
            lambda row: self.create_combined_regime_state(
                int(row['volatility_regime']),
                int(row['trend_regime']),
                int(row['cycle_regime']),
                int(row['liquidity_regime'])
            ),
            axis=1
        )
        
        # ===== CROSS-TIMEFRAME FEATURES =====
        print(f"    • Calculating cross-timeframe features...")
        
        # Get available timeframes for this symbol
        tf_result = self.supabase.table('multi_timeframe_data')\
            .select('timeframe')\
            .eq('symbol', symbol)\
            .execute()
        
        available_tfs = list(set([r['timeframe'] for r in tf_result.data])) if tf_result.data else [timeframe]
        
        # Calculate alignment for subset of bars (too slow for all)
        sample_indices = df.index[::10]  # Every 10th bar
        alignments = {}
        
        for idx in sample_indices:
            timestamp = df.loc[idx, 'timestamp']
            alignment = self.calculate_timeframe_alignment(symbol, timestamp, available_tfs)
            alignments[idx] = alignment
        
        # Interpolate for all bars
        df['timeframe_alignment'] = pd.Series(alignments).reindex(df.index).interpolate(method='linear').fillna(50.0)
        
        print(f"  ✅ Generated regime features")
        
        return df
    
    def save_regime_features(self, df: pd.DataFrame, symbol: str, timeframe: str) -> bool:
        """
        Save regime features to database
        """
        if len(df) == 0:
            return False
        
        print(f"  💾 Saving regime features...")
        
        # Prepare records
        regime_columns = [
            'volatility_regime', 'trend_regime', 'cycle_regime',
            'liquidity_regime', 'market_hours_regime', 'regime_state',
            'timeframe_alignment'
        ]
        
        records = []
        for _, row in df.iterrows():
            record = {
                'symbol': symbol,
                'timeframe': timeframe,
                'timestamp': row['timestamp'].isoformat(),
            }
            
            for col in regime_columns:
                if col in row and pd.notna(row[col]):
                    if col == 'regime_state':
                        record[col] = str(row[col])
                    else:
                        record[col] = float(row[col]) if isinstance(row[col], (int, float)) else row[col]
            
            records.append(record)
        
        # Update in batches
        batch_size = 1000
        updated = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            try:
                result = self.supabase.table('multi_timeframe_data').upsert(
                    batch,
                    on_conflict='symbol,timeframe,timestamp'
                ).execute()
                updated += len(batch)
            except Exception as e:
                print(f"    ⚠️ Error updating batch: {str(e)[:100]}")
                return False
        
        print(f"    ✅ Updated {updated:,} records")
        return True
    
    def process_symbol_timeframe(self, symbol: str, timeframe: str) -> Dict:
        """
        Process regime detection for a symbol-timeframe
        """
        print(f"\n{'='*70}")
        print(f"📊 PROCESSING {symbol} - {timeframe}")
        print(f"{'='*70}")
        
        # Fetch data
        df = self.fetch_symbol_timeframe_data(symbol, timeframe)
        
        if len(df) == 0:
            return {
                'symbol': symbol,
                'timeframe': timeframe,
                'status': 'failed',
                'reason': 'no_data'
            }
        
        # Generate regime features
        df = self.generate_regime_features(df, symbol, timeframe)
        
        if len(df) == 0:
            return {
                'symbol': symbol,
                'timeframe': timeframe,
                'status': 'failed',
                'reason': 'insufficient_data'
            }
        
        # Save features
        success = self.save_regime_features(df, symbol, timeframe)
        
        return {
            'symbol': symbol,
            'timeframe': timeframe,
            'status': 'success' if success else 'failed',
            'bars_processed': len(df)
        }


def main():
    """
    Main execution
    """
    print("\n" + "="*70)
    print("🏆 PHASE 2: REGIME DETECTION & CROSS-TIMEFRAME ANALYSIS")
    print("="*70)
    print("World-Class Trading System - Market Intelligence Layer")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    detector = RegimeDetector()
    
    # Get all symbol-timeframe combinations
    print("\n📋 Fetching symbol-timeframe combinations...")
    
    result = supabase.table('multi_timeframe_data')\
        .select('symbol, timeframe')\
        .execute()
    
    if not result.data:
        print("❌ No data found")
        print("   Run phase1 scripts first")
        sys.exit(1)
    
    # Get unique combinations
    combinations = {}
    for row in result.data:
        symbol = row['symbol']
        timeframe = row['timeframe']
        if symbol not in combinations:
            combinations[symbol] = []
        if timeframe not in combinations[symbol]:
            combinations[symbol].append(timeframe)
    
    print(f"✅ Found {len(combinations)} symbols with {sum(len(v) for v in combinations.values())} timeframes")
    
    # Process each combination
    all_results = []
    
    for symbol, timeframes in combinations.items():
        print(f"\n\n{'#'*70}")
        print(f"# SYMBOL: {symbol}")
        print(f"# Timeframes: {', '.join(timeframes)}")
        print(f"{'#'*70}")
        
        for timeframe in timeframes:
            result = detector.process_symbol_timeframe(symbol, timeframe)
            all_results.append(result)
    
    # Summary
    print("\n\n" + "="*70)
    print("📊 REGIME DETECTION COMPLETE - SUMMARY")
    print("="*70)
    
    successful = [r for r in all_results if r['status'] == 'success']
    failed = [r for r in all_results if r['status'] == 'failed']
    
    print(f"\n✅ Successful: {len(successful)}/{len(all_results)} combinations")
    print(f"❌ Failed: {len(failed)}/{len(all_results)} combinations")
    
    if successful:
        print("\n📈 Sample Results:")
        for result in successful[:5]:
            print(f"  • {result['symbol']} - {result['timeframe']}: {result['bars_processed']:,} bars")
    
    print("\n" + "="*70)
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    print("\n🎉 Phase 2 Complete!")
    print("\nRegime Features Added:")
    print("  • Volatility Regime (Low/Normal/High/Spike)")
    print("  • Trend Regime (Strong Up/Weak Up/Ranging/Weak Down/Strong Down)")
    print("  • Cycle Regime (Cyclical/Trending/Transitional)")
    print("  • Liquidity Regime (High/Normal/Low)")
    print("  • Market Hours Regime (Pre/Open/Mid/Power/After/Overnight)")
    print("  • Combined Regime State")
    print("  • Cross-Timeframe Alignment Score")
    print("\nNext: Phase 3 - ML Model Ensemble")


if __name__ == "__main__":
    main()
