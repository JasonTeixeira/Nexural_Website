#!/usr/bin/env python3
"""
PHASE 1: Multi-Timeframe Data Aggregation Engine
World-Class Trading System - Foundation Layer

This script:
1. Fetches tick-level data from database
2. Aggregates into multiple timeframes (1min, 5min, 15min, 1H, 4H, Daily, Weekly)
3. Calculates volume profile (POC, VAH, VAL)
4. Computes order flow imbalance
5. Generates bid-ask spread statistics
6. Saves to database for feature engineering

Asset-Specific Timeframes:
- Equity Indices (ES, NQ, YM, RTY): 1min, 5min, 15min, 1H, 4H
- Energy (CL, NG): 5min, 15min, 1H, 4H, Daily
- Metals (GC, SI, HG): 5min, 15min, 1H, 4H, Daily
- Crypto (BTC, ETH): 1min, 5min, 15min, 1H, 4H
- Bonds (ZN): 5min, 15min, 1H, 4H, Daily
- FX (6E, 6J, 6A, 6C, 6S): 5min, 15min, 1H, 4H, Daily
- Agriculture (ZC, ZS, ZW): 15min, 1H, 4H, Daily, Weekly
"""

import os
import sys
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from supabase import create_client
from typing import Dict, List, Tuple
import json

# Load environment
load_dotenv('.env.local')

# Supabase connection
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Asset class definitions with optimal timeframes
ASSET_CLASSES = {
    'equity_indices': {
        'symbols': ['ES', 'NQ', 'YM', 'RTY'],
        'timeframes': ['1min', '5min', '15min', '1H', '4H'],
        'holding_period': '2-8 hours'
    },
    'energy': {
        'symbols': ['CL', 'NG'],
        'timeframes': ['5min', '15min', '1H', '4H', 'D'],
        'holding_period': '4-24 hours'
    },
    'metals': {
        'symbols': ['GC', 'SI', 'HG'],
        'timeframes': ['5min', '15min', '1H', '4H', 'D'],
        'holding_period': '6-48 hours'
    },
    'crypto': {
        'symbols': ['BTC', 'ETH'],
        'timeframes': ['1min', '5min', '15min', '1H', '4H'],
        'holding_period': '1-12 hours'
    },
    'bonds': {
        'symbols': ['ZN'],
        'timeframes': ['5min', '15min', '1H', '4H', 'D'],
        'holding_period': '4-24 hours'
    },
    'fx': {
        'symbols': ['6E', '6J', '6A', '6C', '6S'],
        'timeframes': ['5min', '15min', '1H', '4H', 'D'],
        'holding_period': '4-48 hours'
    },
    'agriculture': {
        'symbols': ['ZC', 'ZS', 'ZW'],
        'timeframes': ['15min', '1H', '4H', 'D', 'W'],
        'holding_period': '1-5 days'
    }
}

# Timeframe to pandas frequency mapping
TIMEFRAME_MAP = {
    '1min': '1T',
    '5min': '5T',
    '15min': '15T',
    '1H': '1H',
    '4H': '4H',
    'D': '1D',
    'W': '1W'
}


class MultiTimeframeAggregator:
    """
    Professional-grade multi-timeframe data aggregation engine
    """
    
    def __init__(self):
        self.supabase = supabase
        
    def fetch_tick_data(self, symbol: str, days_back: int = 30) -> pd.DataFrame:
        """
        Fetch all tick data for a symbol
        """
        print(f"\n📊 Fetching tick data for {symbol}...")
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        # Fetch in batches
        all_data = []
        batch_size = 10000
        offset = 0
        
        while True:
            result = self.supabase.table('live_market_data')\
                .select('*')\
                .eq('symbol', symbol)\
                .gte('timestamp', start_date.isoformat())\
                .lte('timestamp', end_date.isoformat())\
                .order('timestamp')\
                .range(offset, offset + batch_size - 1)\
                .execute()
            
            if not result.data:
                break
            
            all_data.extend(result.data)
            
            if len(result.data) < batch_size:
                break
            
            offset += batch_size
            print(f"  Fetched {len(all_data):,} ticks...")
        
        if not all_data:
            print(f"  ⚠️ No data found for {symbol}")
            return pd.DataFrame()
        
        df = pd.DataFrame(all_data)
        print(f"  ✅ Loaded {len(df):,} ticks")
        
        return df
    
    def prepare_tick_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare tick data for aggregation
        """
        # Convert timestamp with ISO8601 format
        df['timestamp'] = pd.to_datetime(df['timestamp'], format='ISO8601', utc=True)
        
        # Ensure numeric columns
        df['price'] = pd.to_numeric(df['price'], errors='coerce')
        df['volume'] = pd.to_numeric(df['volume'], errors='coerce')
        df['bid'] = pd.to_numeric(df['bid'], errors='coerce')
        df['ask'] = pd.to_numeric(df['ask'], errors='coerce')
        
        # Calculate spread
        df['spread'] = df['ask'] - df['bid']
        
        # Classify tick direction (uptick/downtick)
        df['tick_direction'] = np.where(
            df['price'] > df['price'].shift(1), 1,
            np.where(df['price'] < df['price'].shift(1), -1, 0)
        )
        
        # Sort by timestamp
        df = df.sort_values('timestamp')
        
        return df
    
    def aggregate_to_ohlcv(self, df: pd.DataFrame, timeframe: str) -> pd.DataFrame:
        """
        Aggregate tick data to OHLCV bars
        """
        freq = TIMEFRAME_MAP[timeframe]
        
        # Set timestamp as index
        df_indexed = df.set_index('timestamp')
        
        # Aggregate OHLCV
        ohlcv = pd.DataFrame({
            'open': df_indexed['price'].resample(freq).first(),
            'high': df_indexed['price'].resample(freq).max(),
            'low': df_indexed['price'].resample(freq).min(),
            'close': df_indexed['price'].resample(freq).last(),
            'volume': df_indexed['volume'].resample(freq).sum(),
        })
        
        # Drop NaN rows
        ohlcv = ohlcv.dropna()
        
        return ohlcv.reset_index()
    
    def calculate_volume_profile(self, df: pd.DataFrame, timeframe_df: pd.DataFrame, timeframe: str) -> pd.DataFrame:
        """
        Calculate volume profile for each bar (POC, VAH, VAL)
        POC = Point of Control (price with most volume)
        VAH = Value Area High (top of 70% volume area)
        VAL = Value Area Low (bottom of 70% volume area)
        """
        volume_profiles = []
        
        for idx, bar in timeframe_df.iterrows():
            # Get ticks within this bar
            bar_ticks = df[
                (df['timestamp'] >= bar['timestamp']) &
                (df['timestamp'] < bar['timestamp'] + pd.Timedelta(TIMEFRAME_MAP[timeframe]))
            ]
            
            if len(bar_ticks) == 0:
                volume_profiles.append({
                    'poc': bar['close'],
                    'vah': bar['high'],
                    'val': bar['low']
                })
                continue
            
            # Create price bins
            price_range = bar['high'] - bar['low']
            if price_range == 0:
                volume_profiles.append({
                    'poc': bar['close'],
                    'vah': bar['high'],
                    'val': bar['low']
                })
                continue
            
            num_bins = min(20, len(bar_ticks))
            bins = np.linspace(bar['low'], bar['high'], num_bins)
            
            # Calculate volume at each price level
            bar_ticks['price_bin'] = pd.cut(bar_ticks['price'], bins=bins)
            volume_by_price = bar_ticks.groupby('price_bin')['volume'].sum()
            
            # POC = price with most volume
            poc_bin = volume_by_price.idxmax()
            poc = (poc_bin.left + poc_bin.right) / 2 if hasattr(poc_bin, 'left') else bar['close']
            
            # Value Area (70% of volume)
            total_volume = volume_by_price.sum()
            target_volume = total_volume * 0.70
            
            # Sort by volume and accumulate
            sorted_volumes = volume_by_price.sort_values(ascending=False)
            cumsum = 0
            value_area_bins = []
            
            for bin_idx, vol in sorted_volumes.items():
                cumsum += vol
                value_area_bins.append(bin_idx)
                if cumsum >= target_volume:
                    break
            
            # VAH and VAL
            if value_area_bins:
                value_area_prices = [
                    (b.left + b.right) / 2 if hasattr(b, 'left') else bar['close']
                    for b in value_area_bins
                ]
                vah = max(value_area_prices)
                val = min(value_area_prices)
            else:
                vah = bar['high']
                val = bar['low']
            
            volume_profiles.append({
                'poc': poc,
                'vah': vah,
                'val': val
            })
        
        # Add to dataframe
        timeframe_df['volume_poc'] = [vp['poc'] for vp in volume_profiles]
        timeframe_df['volume_vah'] = [vp['vah'] for vp in volume_profiles]
        timeframe_df['volume_val'] = [vp['val'] for vp in volume_profiles]
        
        return timeframe_df
    
    def calculate_order_flow_imbalance(self, df: pd.DataFrame, timeframe_df: pd.DataFrame, timeframe: str) -> pd.DataFrame:
        """
        Calculate order flow imbalance for each bar
        OFI = (Buy Volume - Sell Volume) / Total Volume
        """
        ofi_values = []
        
        for idx, bar in timeframe_df.iterrows():
            # Get ticks within this bar
            bar_ticks = df[
                (df['timestamp'] >= bar['timestamp']) &
                (df['timestamp'] < bar['timestamp'] + pd.Timedelta(TIMEFRAME_MAP[timeframe]))
            ]
            
            if len(bar_ticks) == 0:
                ofi_values.append(0)
                continue
            
            # Classify as buy or sell based on tick direction
            buy_volume = bar_ticks[bar_ticks['tick_direction'] == 1]['volume'].sum()
            sell_volume = bar_ticks[bar_ticks['tick_direction'] == -1]['volume'].sum()
            total_volume = bar_ticks['volume'].sum()
            
            if total_volume > 0:
                ofi = (buy_volume - sell_volume) / total_volume
            else:
                ofi = 0
            
            ofi_values.append(ofi)
        
        timeframe_df['order_flow_imbalance'] = ofi_values
        
        return timeframe_df
    
    def calculate_spread_statistics(self, df: pd.DataFrame, timeframe_df: pd.DataFrame, timeframe: str) -> pd.DataFrame:
        """
        Calculate bid-ask spread statistics for each bar
        """
        spread_stats = []
        
        for idx, bar in timeframe_df.iterrows():
            # Get ticks within this bar
            bar_ticks = df[
                (df['timestamp'] >= bar['timestamp']) &
                (df['timestamp'] < bar['timestamp'] + pd.Timedelta(TIMEFRAME_MAP[timeframe]))
            ]
            
            if len(bar_ticks) == 0 or bar_ticks['spread'].isna().all():
                spread_stats.append({
                    'spread_mean': 0,
                    'spread_std': 0,
                    'spread_max': 0
                })
                continue
            
            spread_stats.append({
                'spread_mean': bar_ticks['spread'].mean(),
                'spread_std': bar_ticks['spread'].std(),
                'spread_max': bar_ticks['spread'].max()
            })
        
        timeframe_df['spread_mean'] = [ss['spread_mean'] for ss in spread_stats]
        timeframe_df['spread_std'] = [ss['spread_std'] for ss in spread_stats]
        timeframe_df['spread_max'] = [ss['spread_max'] for ss in spread_stats]
        
        return timeframe_df
    
    def calculate_tick_statistics(self, df: pd.DataFrame, timeframe_df: pd.DataFrame, timeframe: str) -> pd.DataFrame:
        """
        Calculate tick-level statistics for each bar
        """
        tick_stats = []
        
        for idx, bar in timeframe_df.iterrows():
            # Get ticks within this bar
            bar_ticks = df[
                (df['timestamp'] >= bar['timestamp']) &
                (df['timestamp'] < bar['timestamp'] + pd.Timedelta(TIMEFRAME_MAP[timeframe]))
            ]
            
            if len(bar_ticks) == 0:
                tick_stats.append({
                    'tick_count': 0,
                    'uptick_ratio': 0.5,
                    'trade_intensity': 0
                })
                continue
            
            tick_count = len(bar_ticks)
            upticks = (bar_ticks['tick_direction'] == 1).sum()
            uptick_ratio = upticks / tick_count if tick_count > 0 else 0.5
            
            # Trade intensity = ticks per minute
            time_span = (bar_ticks['timestamp'].max() - bar_ticks['timestamp'].min()).total_seconds() / 60
            trade_intensity = tick_count / time_span if time_span > 0 else 0
            
            tick_stats.append({
                'tick_count': tick_count,
                'uptick_ratio': uptick_ratio,
                'trade_intensity': trade_intensity
            })
        
        timeframe_df['tick_count'] = [ts['tick_count'] for ts in tick_stats]
        timeframe_df['uptick_ratio'] = [ts['uptick_ratio'] for ts in tick_stats]
        timeframe_df['trade_intensity'] = [ts['trade_intensity'] for ts in tick_stats]
        
        return timeframe_df
    
    def process_symbol_timeframe(self, symbol: str, timeframe: str, tick_data: pd.DataFrame) -> pd.DataFrame:
        """
        Process a single symbol-timeframe combination
        """
        print(f"\n  🔧 Processing {symbol} - {timeframe}...")
        
        # Aggregate to OHLCV
        ohlcv = self.aggregate_to_ohlcv(tick_data, timeframe)
        
        if len(ohlcv) == 0:
            print(f"    ⚠️ No bars created for {timeframe}")
            return pd.DataFrame()
        
        print(f"    ✅ Created {len(ohlcv):,} bars")
        
        # Calculate volume profile
        ohlcv = self.calculate_volume_profile(tick_data, ohlcv, timeframe)
        
        # Calculate order flow imbalance
        ohlcv = self.calculate_order_flow_imbalance(tick_data, ohlcv, timeframe)
        
        # Calculate spread statistics
        ohlcv = self.calculate_spread_statistics(tick_data, ohlcv, timeframe)
        
        # Calculate tick statistics
        ohlcv = self.calculate_tick_statistics(tick_data, ohlcv, timeframe)
        
        # Add metadata
        ohlcv['symbol'] = symbol
        ohlcv['timeframe'] = timeframe
        
        return ohlcv
    
    def save_to_database(self, df: pd.DataFrame, symbol: str, timeframe: str) -> bool:
        """
        Save aggregated data to database
        """
        if len(df) == 0:
            return False
        
        print(f"    💾 Saving to database...")
        
        # Prepare records
        records = []
        for _, row in df.iterrows():
            record = {
                'symbol': symbol,
                'timeframe': timeframe,
                'timestamp': row['timestamp'].isoformat(),
                'open': float(row['open']),
                'high': float(row['high']),
                'low': float(row['low']),
                'close': float(row['close']),
                'volume': float(row['volume']),
                'volume_poc': float(row['volume_poc']),
                'volume_vah': float(row['volume_vah']),
                'volume_val': float(row['volume_val']),
                'order_flow_imbalance': float(row['order_flow_imbalance']),
                'spread_mean': float(row['spread_mean']),
                'spread_std': float(row['spread_std']),
                'spread_max': float(row['spread_max']),
                'tick_count': int(row['tick_count']),
                'uptick_ratio': float(row['uptick_ratio']),
                'trade_intensity': float(row['trade_intensity'])
            }
            records.append(record)
        
        # Insert in batches
        batch_size = 1000
        inserted = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            try:
                result = self.supabase.table('multi_timeframe_data').upsert(
                    batch,
                    on_conflict='symbol,timeframe,timestamp'
                ).execute()
                inserted += len(batch)
            except Exception as e:
                print(f"    ⚠️ Error inserting batch: {str(e)[:100]}")
                return False
        
        print(f"    ✅ Saved {inserted:,} bars")
        return True
    
    def process_symbol(self, symbol: str, asset_class: str) -> Dict:
        """
        Process all timeframes for a symbol
        """
        print(f"\n{'='*70}")
        print(f"📊 PROCESSING {symbol} ({asset_class.upper()})")
        print(f"{'='*70}")
        
        # Get timeframes for this asset class
        timeframes = ASSET_CLASSES[asset_class]['timeframes']
        
        # Fetch tick data
        tick_data = self.fetch_tick_data(symbol, days_back=30)
        
        if len(tick_data) == 0:
            return {
                'symbol': symbol,
                'status': 'failed',
                'reason': 'no_tick_data'
            }
        
        # Prepare tick data
        tick_data = self.prepare_tick_data(tick_data)
        
        # Process each timeframe
        results = {}
        for timeframe in timeframes:
            try:
                df = self.process_symbol_timeframe(symbol, timeframe, tick_data)
                if len(df) > 0:
                    success = self.save_to_database(df, symbol, timeframe)
                    results[timeframe] = {
                        'bars': len(df),
                        'success': success
                    }
                else:
                    results[timeframe] = {
                        'bars': 0,
                        'success': False
                    }
            except Exception as e:
                print(f"    ❌ Error processing {timeframe}: {str(e)[:100]}")
                results[timeframe] = {
                    'bars': 0,
                    'success': False,
                    'error': str(e)[:100]
                }
        
        return {
            'symbol': symbol,
            'status': 'success',
            'timeframes': results,
            'tick_count': len(tick_data)
        }


def main():
    """
    Main execution
    """
    print("\n" + "="*70)
    print("🏆 PHASE 1: MULTI-TIMEFRAME DATA AGGREGATION")
    print("="*70)
    print("World-Class Trading System - Foundation Layer")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    aggregator = MultiTimeframeAggregator()
    
    all_results = []
    
    # Process each asset class
    for asset_class, config in ASSET_CLASSES.items():
        print(f"\n\n{'#'*70}")
        print(f"# ASSET CLASS: {asset_class.upper()}")
        print(f"# Symbols: {', '.join(config['symbols'])}")
        print(f"# Timeframes: {', '.join(config['timeframes'])}")
        print(f"# Holding Period: {config['holding_period']}")
        print(f"{'#'*70}")
        
        for symbol in config['symbols']:
            result = aggregator.process_symbol(symbol, asset_class)
            all_results.append(result)
    
    # Summary
    print("\n\n" + "="*70)
    print("📊 AGGREGATION COMPLETE - SUMMARY")
    print("="*70)
    
    successful = [r for r in all_results if r['status'] == 'success']
    failed = [r for r in all_results if r['status'] == 'failed']
    
    print(f"\n✅ Successful: {len(successful)}/{len(all_results)} symbols")
    print(f"❌ Failed: {len(failed)}/{len(all_results)} symbols")
    
    if successful:
        print("\n📈 Successful Symbols:")
        for result in successful:
            symbol = result['symbol']
            tick_count = result.get('tick_count', 0)
            timeframes = result.get('timeframes', {})
            total_bars = sum(tf['bars'] for tf in timeframes.values())
            print(f"  • {symbol}: {tick_count:,} ticks → {total_bars:,} bars across {len(timeframes)} timeframes")
    
    if failed:
        print("\n❌ Failed Symbols:")
        for result in failed:
            print(f"  • {result['symbol']}: {result.get('reason', 'unknown error')}")
    
    print("\n" + "="*70)
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    print("\n🎉 Phase 1 Foundation Complete!")
    print("Next: Phase 1 Feature Engineering")


if __name__ == "__main__":
    main()
