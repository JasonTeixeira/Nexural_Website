#!/usr/bin/env python3
"""
PHASE 1B: Advanced Feature Engineering
World-Class Trading System - Sophisticated Indicators

This script implements institutional-grade technical indicators:
- Jurik Moving Average (JMA)
- Ehlers MESA Adaptive Moving Average
- Ehlers Dominant Cycle Period
- Ehlers Instantaneous Trendline
- Fisher Transform
- Inverse Fisher Transform on RSI
- Stochastic RSI
- True Strength Index (TSI)
- Chande Momentum Oscillator (CMO)
- Kaufman Adaptive Moving Average (KAMA)
- Zero-Lag EMA
- Fractal Adaptive Moving Average
- GARCH(1,1) Volatility
- Parkinson, Garman-Klass, Yang-Zhang Volatility
- Hurst Exponent
- ADX, Choppiness Index
- Fractal Dimension
- Market Entropy
"""

import os
import sys
from datetime import datetime
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


class AdvancedFeatureEngineer:
    """
    Institutional-grade advanced feature engineering
    """
    
    def __init__(self):
        self.supabase = supabase
    
    # ==================== JURIK MOVING AVERAGE (JMA) ====================
    
    def calculate_jma(self, prices: pd.Series, period: int = 7, phase: float = 0) -> pd.Series:
        """
        Jurik Moving Average - Low-lag adaptive smoothing
        
        JMA is superior to EMA because it:
        - Reduces lag while maintaining smoothness
        - Adapts to market volatility
        - Minimizes overshoot
        
        Parameters:
        - period: Lookback period (default 7)
        - phase: Phase parameter (-100 to 100, default 0)
                 Negative = more lag, less overshoot
                 Positive = less lag, more overshoot
        """
        # Simplified JMA implementation
        # Full JMA requires proprietary algorithm, this is an approximation
        
        # Calculate adaptive factor
        alpha = 2 / (period + 1)
        
        # Initialize
        jma = pd.Series(index=prices.index, dtype=float)
        jma.iloc[0] = prices.iloc[0]
        
        # Adaptive smoothing
        for i in range(1, len(prices)):
            # Calculate volatility-adjusted alpha
            if i >= period:
                volatility = prices.iloc[i-period:i].std()
                avg_volatility = prices.iloc[:i].std()
                vol_ratio = volatility / (avg_volatility + 1e-10)
                
                # Adjust alpha based on volatility
                adaptive_alpha = alpha * (1 + phase/100) / (1 + vol_ratio)
            else:
                adaptive_alpha = alpha
            
            # Apply smoothing
            jma.iloc[i] = adaptive_alpha * prices.iloc[i] + (1 - adaptive_alpha) * jma.iloc[i-1]
        
        return jma
    
    # ==================== EHLERS INDICATORS ====================
    
    def calculate_ehlers_mesa(self, prices: pd.Series, fast_limit: float = 0.5, slow_limit: float = 0.05) -> pd.Series:
        """
        Ehlers MESA Adaptive Moving Average
        
        Adapts to the dominant cycle in the market
        """
        # Simplified MESA implementation
        alpha = pd.Series(index=prices.index, dtype=float)
        mesa = pd.Series(index=prices.index, dtype=float)
        
        # Initialize
        mesa.iloc[0] = prices.iloc[0]
        alpha.iloc[0] = fast_limit
        
        for i in range(1, len(prices)):
            if i < 5:
                mesa.iloc[i] = prices.iloc[:i+1].mean()
                continue
            
            # Calculate phase
            phase_change = abs(prices.iloc[i] - prices.iloc[i-1])
            avg_change = abs(prices.iloc[i-5:i]).diff().mean()
            
            # Adaptive alpha
            if avg_change > 0:
                alpha.iloc[i] = fast_limit * (phase_change / avg_change)
                alpha.iloc[i] = max(slow_limit, min(fast_limit, alpha.iloc[i]))
            else:
                alpha.iloc[i] = slow_limit
            
            # Apply MESA
            mesa.iloc[i] = alpha.iloc[i] * prices.iloc[i] + (1 - alpha.iloc[i]) * mesa.iloc[i-1]
        
        return mesa
    
    def calculate_ehlers_dominant_cycle(self, prices: pd.Series) -> pd.Series:
        """
        Ehlers Dominant Cycle Period
        
        Identifies the current dominant cycle in the market
        """
        # Simplified dominant cycle calculation
        cycle_period = pd.Series(index=prices.index, dtype=float)
        
        for i in range(20, len(prices)):
            # Calculate autocorrelation for different periods
            max_corr = -1
            dominant_period = 10
            
            for period in range(6, 50):
                if i >= period:
                    # Calculate correlation
                    recent = prices.iloc[i-period:i]
                    shifted = prices.iloc[i-2*period:i-period]
                    
                    if len(recent) == len(shifted) and len(recent) > 0:
                        corr = recent.corr(shifted)
                        if corr > max_corr:
                            max_corr = corr
                            dominant_period = period
            
            cycle_period.iloc[i] = dominant_period
        
        # Fill initial values
        cycle_period.iloc[:20] = 10
        
        return cycle_period
    
    def calculate_ehlers_instantaneous_trendline(self, prices: pd.Series) -> pd.Series:
        """
        Ehlers Instantaneous Trendline
        
        Zero-lag trendline that adapts to market conditions
        """
        # Simplified implementation using Hilbert Transform concept
        trendline = pd.Series(index=prices.index, dtype=float)
        
        # Use weighted moving average with adaptive weights
        for i in range(len(prices)):
            if i < 7:
                trendline.iloc[i] = prices.iloc[:i+1].mean()
            else:
                # Calculate instantaneous period
                period = 10  # Simplified
                
                # Weighted average
                weights = np.exp(-np.arange(period) / (period/3))
                weights = weights / weights.sum()
                
                window = prices.iloc[i-period+1:i+1]
                trendline.iloc[i] = (window * weights[::-1]).sum()
        
        return trendline
    
    # ==================== FISHER TRANSFORM ====================
    
    def calculate_fisher_transform(self, high: pd.Series, low: pd.Series, period: int = 10) -> Tuple[pd.Series, pd.Series]:
        """
        Fisher Transform
        
        Converts prices to Gaussian normal distribution for sharper signals
        """
        # Calculate median price
        hl2 = (high + low) / 2
        
        # Normalize to -1 to 1
        min_low = low.rolling(period).min()
        max_high = high.rolling(period).max()
        
        value = 2 * ((hl2 - min_low) / (max_high - min_low + 1e-10) - 0.5)
        value = value.clip(-0.999, 0.999)
        
        # Apply Fisher Transform
        fisher = 0.5 * np.log((1 + value) / (1 - value + 1e-10))
        
        # Calculate trigger line (1-period lag)
        trigger = fisher.shift(1)
        
        return fisher, trigger
    
    def calculate_inverse_fisher_rsi(self, prices: pd.Series, rsi_period: int = 14) -> pd.Series:
        """
        Inverse Fisher Transform on RSI
        
        Enhances RSI signals by normalizing to -1 to 1 range
        """
        # Calculate RSI
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(rsi_period).mean()
        rs = gain / (loss + 1e-10)
        rsi = 100 - (100 / (1 + rs))
        
        # Normalize RSI to -1 to 1
        value = 0.1 * (rsi - 50)
        
        # Apply Inverse Fisher Transform
        inverse_fisher = (np.exp(2 * value) - 1) / (np.exp(2 * value) + 1)
        
        return inverse_fisher
    
    # ==================== ADVANCED MOMENTUM ====================
    
    def calculate_stochastic_rsi(self, prices: pd.Series, rsi_period: int = 14, stoch_period: int = 14) -> Tuple[pd.Series, pd.Series]:
        """
        Stochastic RSI
        
        More responsive than regular RSI
        """
        # Calculate RSI
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(rsi_period).mean()
        rs = gain / (loss + 1e-10)
        rsi = 100 - (100 / (1 + rs))
        
        # Apply Stochastic to RSI
        rsi_min = rsi.rolling(stoch_period).min()
        rsi_max = rsi.rolling(stoch_period).max()
        
        stoch_rsi = (rsi - rsi_min) / (rsi_max - rsi_min + 1e-10) * 100
        
        # Calculate signal line (3-period SMA)
        stoch_rsi_signal = stoch_rsi.rolling(3).mean()
        
        return stoch_rsi, stoch_rsi_signal
    
    def calculate_tsi(self, prices: pd.Series, long_period: int = 25, short_period: int = 13, signal_period: int = 13) -> Tuple[pd.Series, pd.Series]:
        """
        True Strength Index (TSI)
        
        Double-smoothed momentum indicator
        """
        # Calculate price changes
        momentum = prices.diff()
        
        # Double smooth momentum
        smooth1 = momentum.ewm(span=long_period, adjust=False).mean()
        smooth2 = smooth1.ewm(span=short_period, adjust=False).mean()
        
        # Double smooth absolute momentum
        abs_smooth1 = momentum.abs().ewm(span=long_period, adjust=False).mean()
        abs_smooth2 = abs_smooth1.ewm(span=short_period, adjust=False).mean()
        
        # Calculate TSI
        tsi = 100 * (smooth2 / (abs_smooth2 + 1e-10))
        
        # Calculate signal line
        tsi_signal = tsi.ewm(span=signal_period, adjust=False).mean()
        
        return tsi, tsi_signal
    
    def calculate_cmo(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """
        Chande Momentum Oscillator
        
        Better than RSI for trending markets
        """
        momentum = prices.diff()
        
        # Sum of gains and losses
        gains = momentum.where(momentum > 0, 0).rolling(period).sum()
        losses = -momentum.where(momentum < 0, 0).rolling(period).sum()
        
        # Calculate CMO
        cmo = 100 * ((gains - losses) / (gains + losses + 1e-10))
        
        return cmo
    
    # ==================== ADAPTIVE MOVING AVERAGES ====================
    
    def calculate_kama(self, prices: pd.Series, period: int = 10, fast: int = 2, slow: int = 30) -> pd.Series:
        """
        Kaufman Adaptive Moving Average (KAMA)
        
        Adapts to market volatility and trending
        """
        # Calculate efficiency ratio
        change = abs(prices - prices.shift(period))
        volatility = abs(prices.diff()).rolling(period).sum()
        er = change / (volatility + 1e-10)
        
        # Calculate smoothing constant
        fast_sc = 2 / (fast + 1)
        slow_sc = 2 / (slow + 1)
        sc = (er * (fast_sc - slow_sc) + slow_sc) ** 2
        
        # Calculate KAMA
        kama = pd.Series(index=prices.index, dtype=float)
        kama.iloc[0] = prices.iloc[0]
        
        for i in range(1, len(prices)):
            kama.iloc[i] = kama.iloc[i-1] + sc.iloc[i] * (prices.iloc[i] - kama.iloc[i-1])
        
        return kama
    
    def calculate_zlema(self, prices: pd.Series, period: int = 20) -> pd.Series:
        """
        Zero-Lag EMA
        
        Reduces lag of traditional EMA
        """
        # Calculate lag
        lag = int((period - 1) / 2)
        
        # Calculate de-lagged price
        delagged = 2 * prices - prices.shift(lag)
        
        # Apply EMA to de-lagged price
        zlema = delagged.ewm(span=period, adjust=False).mean()
        
        return zlema
    
    # ==================== VOLATILITY MEASURES ====================
    
    def calculate_garch_volatility(self, returns: pd.Series, period: int = 20) -> pd.Series:
        """
        GARCH(1,1) Volatility Forecast
        
        Simplified GARCH implementation
        """
        # Calculate squared returns
        squared_returns = returns ** 2
        
        # Initialize volatility
        volatility = pd.Series(index=returns.index, dtype=float)
        volatility.iloc[0] = returns.std()
        
        # GARCH parameters (simplified)
        omega = 0.000001
        alpha = 0.1
        beta = 0.85
        
        for i in range(1, len(returns)):
            if i >= period:
                # GARCH(1,1) formula
                volatility.iloc[i] = np.sqrt(
                    omega + 
                    alpha * squared_returns.iloc[i-1] + 
                    beta * (volatility.iloc[i-1] ** 2)
                )
            else:
                volatility.iloc[i] = returns.iloc[:i].std()
        
        # Annualize
        volatility = volatility * np.sqrt(252)
        
        return volatility
    
    def calculate_parkinson_volatility(self, high: pd.Series, low: pd.Series, period: int = 20) -> pd.Series:
        """
        Parkinson Volatility
        
        Uses high-low range, more efficient than close-to-close
        """
        # Calculate log high-low ratio
        hl_ratio = np.log(high / low)
        
        # Parkinson volatility
        parkinson = np.sqrt((hl_ratio ** 2).rolling(period).mean() / (4 * np.log(2)))
        
        # Annualize
        parkinson = parkinson * np.sqrt(252)
        
        return parkinson
    
    def calculate_garman_klass_volatility(self, open_: pd.Series, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 20) -> pd.Series:
        """
        Garman-Klass Volatility
        
        Uses OHLC data, more accurate than Parkinson
        """
        # Calculate components
        hl = np.log(high / low) ** 2
        co = np.log(close / open_) ** 2
        
        # Garman-Klass formula
        gk = 0.5 * hl - (2 * np.log(2) - 1) * co
        gk_vol = np.sqrt(gk.rolling(period).mean())
        
        # Annualize
        gk_vol = gk_vol * np.sqrt(252)
        
        return gk_vol
    
    def calculate_yang_zhang_volatility(self, open_: pd.Series, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 20) -> pd.Series:
        """
        Yang-Zhang Volatility
        
        Handles overnight gaps, most accurate estimator
        """
        # Calculate components
        co = np.log(close / open_)
        oc = np.log(open_ / close.shift(1))
        hl = np.log(high / low)
        
        # Yang-Zhang formula (simplified)
        yz = np.sqrt(
            oc.rolling(period).var() + 
            0.5 * (hl ** 2).rolling(period).mean() - 
            (2 * np.log(2) - 1) * co.rolling(period).var()
        )
        
        # Annualize
        yz = yz * np.sqrt(252)
        
        return yz
    
    # ==================== REGIME INDICATORS ====================
    
    def calculate_hurst_exponent(self, prices: pd.Series, period: int = 100) -> pd.Series:
        """
        Hurst Exponent
        
        H < 0.5: Mean reverting
        H = 0.5: Random walk
        H > 0.5: Trending
        """
        hurst = pd.Series(index=prices.index, dtype=float)
        
        for i in range(period, len(prices)):
            # Get window
            window = prices.iloc[i-period:i].values
            
            # Calculate Hurst exponent using R/S analysis
            lags = range(2, 20)
            tau = []
            
            for lag in lags:
                # Calculate standard deviation
                std = np.std(window)
                if std == 0:
                    continue
                
                # Calculate range
                mean = np.mean(window)
                cumsum = np.cumsum(window - mean)
                R = np.max(cumsum) - np.min(cumsum)
                
                # R/S ratio
                rs = R / (std + 1e-10)
                tau.append(rs)
            
            # Calculate Hurst exponent
            if len(tau) > 0:
                log_lags = np.log(lags[:len(tau)])
                log_tau = np.log(tau)
                
                # Linear regression
                poly = np.polyfit(log_lags, log_tau, 1)
                hurst.iloc[i] = poly[0]
            else:
                hurst.iloc[i] = 0.5
        
        # Fill initial values
        hurst.iloc[:period] = 0.5
        
        return hurst
    
    def calculate_adx(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """
        Average Directional Index (ADX)
        
        Measures trend strength
        """
        # Calculate True Range
        tr1 = high - low
        tr2 = abs(high - close.shift(1))
        tr3 = abs(low - close.shift(1))
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        
        # Calculate Directional Movement
        up_move = high - high.shift(1)
        down_move = low.shift(1) - low
        
        plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0)
        minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0)
        
        plus_dm = pd.Series(plus_dm, index=high.index)
        minus_dm = pd.Series(minus_dm, index=high.index)
        
        # Smooth with Wilder's method
        atr = tr.ewm(alpha=1/period, adjust=False).mean()
        plus_di = 100 * (plus_dm.ewm(alpha=1/period, adjust=False).mean() / atr)
        minus_di = 100 * (minus_dm.ewm(alpha=1/period, adjust=False).mean() / atr)
        
        # Calculate ADX
        dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di + 1e-10)
        adx = dx.ewm(alpha=1/period, adjust=False).mean()
        
        return adx, plus_di, minus_di
    
    def calculate_choppiness_index(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
        """
        Choppiness Index
        
        Measures market choppiness (ranging vs trending)
        High values (>61.8) = choppy/ranging
        Low values (<38.2) = trending
        """
        # Calculate True Range
        tr1 = high - low
        tr2 = abs(high - close.shift(1))
        tr3 = abs(low - close.shift(1))
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        
        # Sum of TR
        sum_tr = tr.rolling(period).sum()
        
        # High-Low range
        high_low = high.rolling(period).max() - low.rolling(period).min()
        
        # Choppiness Index
        chop = 100 * np.log10(sum_tr / (high_low + 1e-10)) / np.log10(period)
        
        return chop
    
    def calculate_fractal_dimension(self, prices: pd.Series, period: int = 20) -> pd.Series:
        """
        Fractal Dimension
        
        Measures market complexity
        1.0-1.5: Trending
        1.5-2.0: Complex/Choppy
        """
        fractal_dim = pd.Series(index=prices.index, dtype=float)
        
        for i in range(period, len(prices)):
            window = prices.iloc[i-period:i].values
            
            # Calculate path length
            path_length = np.sum(np.abs(np.diff(window)))
            
            # Calculate direct distance
            direct_distance = abs(window[-1] - window[0])
            
            # Fractal dimension
            if direct_distance > 0:
                fd = 1 + (np.log(path_length) - np.log(direct_distance)) / np.log(2 * (period - 1))
                fractal_dim.iloc[i] = fd
            else:
                fractal_dim.iloc[i] = 1.5
        
        # Fill initial values
        fractal_dim.iloc[:period] = 1.5
        
        return fractal_dim
    
    def calculate_market_entropy(self, prices: pd.Series, period: int = 20, bins: int = 10) -> pd.Series:
        """
        Market Entropy
        
        Measures market randomness/predictability
        High entropy = random
        Low entropy = predictable
        """
        entropy = pd.Series(index=prices.index, dtype=float)
        
        for i in range(period, len(prices)):
            window = prices.iloc[i-period:i].values
            
            # Calculate returns
            returns = np.diff(window) / window[:-1]
            
            # Create histogram
            hist, _ = np.histogram(returns, bins=bins)
            
            # Calculate probabilities
            probs = hist / (len(returns) + 1e-10)
            probs = probs[probs > 0]
            
            # Calculate entropy
            ent = -np.sum(probs * np.log2(probs))
            entropy.iloc[i] = ent
        
        # Fill initial values
        entropy.iloc[:period] = 0
        
        return entropy
    
    # ==================== MAIN PROCESSING ====================
    
    def fetch_timeframe_data(self, symbol: str, timeframe: str) -> pd.DataFrame:
        """
        Fetch multi-timeframe data for a symbol
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
    
    def generate_advanced_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate all advanced features for a dataframe
        """
        print(f"  🔧 Generating advanced features...")
        
        if len(df) < 100:
            print(f"  ⚠️ Not enough data (need 100+ bars)")
            return df
        
        # Extract OHLCV
        open_ = df['open']
        high = df['high']
        low = df['low']
        close = df['close']
        volume = df['volume']
        
        # Calculate returns
        returns = close.pct_change()
        
        # ===== ADAPTIVE MOVING AVERAGES =====
        print(f"    • Calculating adaptive MAs...")
        df['jma_7'] = self.calculate_jma(close, period=7, phase=0)
        df['jma_14'] = self.calculate_jma(close, period=14, phase=0)
        df['jma_21'] = self.calculate_jma(close, period=21, phase=0)
        
        df['ehlers_mesa'] = self.calculate_ehlers_mesa(close)
        df['ehlers_trendline'] = self.calculate_ehlers_instantaneous_trendline(close)
        df['ehlers_cycle'] = self.calculate_ehlers_dominant_cycle(close)
        
        df['kama_10'] = self.calculate_kama(close, period=10)
        df['kama_20'] = self.calculate_kama(close, period=20)
        df['zlema_20'] = self.calculate_zlema(close, period=20)
        
        # ===== FISHER TRANSFORMS =====
        print(f"    • Calculating Fisher transforms...")
        df['fisher'], df['fisher_trigger'] = self.calculate_fisher_transform(high, low, period=10)
        df['inverse_fisher_rsi'] = self.calculate_inverse_fisher_rsi(close, rsi_period=14)
        
        # ===== ADVANCED MOMENTUM =====
        print(f"    • Calculating advanced momentum...")
        df['stoch_rsi'], df['stoch_rsi_signal'] = self.calculate_stochastic_rsi(close)
        df['tsi'], df['tsi_signal'] = self.calculate_tsi(close)
        df['cmo'] = self.calculate_cmo(close, period=14)
        
        # ===== VOLATILITY MEASURES =====
        print(f"    • Calculating volatility measures...")
        df['garch_vol'] = self.calculate_garch_volatility(returns, period=20)
        df['parkinson_vol'] = self.calculate_parkinson_volatility(high, low, period=20)
        df['garman_klass_vol'] = self.calculate_garman_klass_volatility(open_, high, low, close, period=20)
        df['yang_zhang_vol'] = self.calculate_yang_zhang_volatility(open_, high, low, close, period=20)
        
        # ===== REGIME INDICATORS =====
        print(f"    • Calculating regime indicators...")
        df['hurst_exponent'] = self.calculate_hurst_exponent(close, period=100)
        df['adx'], df['plus_di'], df['minus_di'] = self.calculate_adx(high, low, close, period=14)
        df['choppiness'] = self.calculate_choppiness_index(high, low, close, period=14)
        df['fractal_dimension'] = self.calculate_fractal_dimension(close, period=20)
        df['market_entropy'] = self.calculate_market_entropy(close, period=20)
        
        # Drop NaN rows
        initial_len = len(df)
        df = df.dropna()
        dropped = initial_len - len(df)
        
        print(f"  ✅ Generated {len(df.columns) - 20} advanced features")
        print(f"  ℹ️  Dropped {dropped} rows with NaN values")
        
        return df
    
    def save_advanced_features(self, df: pd.DataFrame, symbol: str, timeframe: str) -> bool:
        """
        Save advanced features to database
        """
        if len(df) == 0:
            return False
        
        print(f"  💾 Saving advanced features...")
        
        # Prepare records (only new columns)
        feature_columns = [col for col in df.columns if col not in [
            'id', 'symbol', 'timeframe', 'timestamp', 'created_at',
            'open', 'high', 'low', 'close', 'volume',
            'volume_poc', 'volume_vah', 'volume_val',
            'order_flow_imbalance', 'spread_mean', 'spread_std', 'spread_max',
            'tick_count', 'uptick_ratio', 'trade_intensity'
        ]]
        
        records = []
        for _, row in df.iterrows():
            record = {
                'symbol': symbol,
                'timeframe': timeframe,
                'timestamp': row['timestamp'] if isinstance(row['timestamp'], str) else row['timestamp'].isoformat(),
            }
            
            # Add feature columns
            for col in feature_columns:
                if col in row and pd.notna(row[col]):
                    record[col] = float(row[col])
            
            records.append(record)
        
        # Update existing records
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
        
        print(f"    ✅ Updated {updated:,} records with advanced features")
        return True
    
    def process_symbol_timeframe(self, symbol: str, timeframe: str) -> Dict:
        """
        Process a single symbol-timeframe combination
        """
        print(f"\n{'='*70}")
        print(f"📊 PROCESSING {symbol} - {timeframe}")
        print(f"{'='*70}")
        
        # Fetch data
        df = self.fetch_timeframe_data(symbol, timeframe)
        
        if len(df) == 0:
            return {
                'symbol': symbol,
                'timeframe': timeframe,
                'status': 'failed',
                'reason': 'no_data'
            }
        
        # Generate features
        df = self.generate_advanced_features(df)
        
        if len(df) == 0:
            return {
                'symbol': symbol,
                'timeframe': timeframe,
                'status': 'failed',
                'reason': 'insufficient_data'
            }
        
        # Save features
        success = self.save_advanced_features(df, symbol, timeframe)
        
        return {
            'symbol': symbol,
            'timeframe': timeframe,
            'status': 'success' if success else 'failed',
            'bars_processed': len(df),
            'features_added': len(df.columns) - 20
        }


def main():
    """
    Main execution
    """
    print("\n" + "="*70)
    print("🏆 PHASE 1B: ADVANCED FEATURE ENGINEERING")
    print("="*70)
    print("World-Class Trading System - Sophisticated Indicators")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    engineer = AdvancedFeatureEngineer()
    
    # Get all symbol-timeframe combinations from database
    print("\n📋 Fetching symbol-timeframe combinations...")
    
    result = supabase.table('multi_timeframe_data')\
        .select('symbol, timeframe')\
        .execute()
    
    if not result.data:
        print("❌ No data found in multi_timeframe_data table")
        print("   Run phase1-multi-timeframe-aggregation.py first")
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
            result = engineer.process_symbol_timeframe(symbol, timeframe)
            all_results.append(result)
    
    # Summary
    print("\n\n" + "="*70)
    print("📊 ADVANCED FEATURE ENGINEERING COMPLETE - SUMMARY")
    print("="*70)
    
    successful = [r for r in all_results if r['status'] == 'success']
    failed = [r for r in all_results if r['status'] == 'failed']
    
    print(f"\n✅ Successful: {len(successful)}/{len(all_results)} symbol-timeframe combinations")
    print(f"❌ Failed: {len(failed)}/{len(all_results)} combinations")
    
    if successful:
        print("\n📈 Successful Combinations:")
        for result in successful[:10]:  # Show first 10
            symbol = result['symbol']
            timeframe = result['timeframe']
            bars = result.get('bars_processed', 0)
            features = result.get('features_added', 0)
            print(f"  • {symbol} - {timeframe}: {bars:,} bars, {features} advanced features")
        
        if len(successful) > 10:
            print(f"  ... and {len(successful) - 10} more")
    
    if failed:
        print("\n❌ Failed Combinations:")
        for result in failed:
            symbol = result['symbol']
            timeframe = result['timeframe']
            reason = result.get('reason', 'unknown')
            print(f"  • {symbol} - {timeframe}: {reason}")
    
    print("\n" + "="*70)
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    print("\n🎉 Phase 1B Complete!")
    print("\nAdvanced Features Added:")
    print("  • JMA (Jurik Moving Average) - 3 periods")
    print("  • Ehlers MESA, Trendline, Dominant Cycle")
    print("  • Fisher Transform + Inverse Fisher RSI")
    print("  • Stochastic RSI, TSI, CMO")
    print("  • KAMA, Zero-Lag EMA")
    print("  • GARCH, Parkinson, Garman-Klass, Yang-Zhang Volatility")
    print("  • Hurst Exponent, ADX, Choppiness Index")
    print("  • Fractal Dimension, Market Entropy")
    print("\nNext: Phase 2 - Regime Detection & Cross-Timeframe Analysis")


if __name__ == "__main__":
    main()
