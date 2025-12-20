#!/usr/bin/env python3
"""
Working ML feature generation - uses price data to create OHLC bars
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from supabase import create_client
import ta
import json

# Load environment variables
load_dotenv('.env.local')

# Configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials")
    sys.exit(1)

# Connect to Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Symbols to process
SYMBOLS = [
    'ES', 'NQ', 'RTY', 'YM',  # Equity indices
    'CL', 'GC', 'SI', 'NG', 'HG',  # Energy & Metals
    'BTC', 'ETH',  # Crypto
    'ZN',  # Bonds
    '6E', '6J', '6A', '6C', '6S',  # Currencies
    'ZC', 'ZS', 'ZW',  # Agriculture
]

def fetch_all_data(symbol):
    """Fetch all data for a symbol"""
    all_data = []
    limit = 10000
    offset = 0
    
    while True:
        result = supabase.table('live_market_data')\
            .select('*')\
            .eq('symbol', symbol)\
            .order('timestamp')\
            .range(offset, offset + limit - 1)\
            .execute()
        
        if not result.data:
            break
            
        all_data.extend(result.data)
        
        if len(result.data) < limit:
            break
            
        offset += limit
    
    return all_data

def resample_to_hourly_ohlc(df):
    """Convert tick data to hourly OHLC bars using price column"""
    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    df = df.set_index('timestamp')
    
    # Use price column for OHLC
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    
    # Resample to hourly bars
    ohlc = df['price'].resample('1H').ohlc()
    volume = df['volume'].resample('1H').sum()
    
    # Combine
    result = pd.DataFrame({
        'open': ohlc['open'],
        'high': ohlc['high'],
        'low': ohlc['low'],
        'close': ohlc['close'],
        'volume': volume
    })
    
    # Drop rows with NaN
    result = result.dropna()
    
    return result.reset_index()

def generate_features_for_symbol(symbol):
    """Generate ML features for a single symbol"""
    
    print(f"\n📊 Processing {symbol}...")
    
    try:
        # Fetch ALL tick data
        data = fetch_all_data(symbol)
        
        if not data:
            print(f"  ❌ No data found for {symbol}")
            return False
        
        df = pd.DataFrame(data)
        print(f"  ✅ Loaded {len(df):,} ticks")
        
        # Convert to hourly OHLC bars
        print(f"  🔄 Converting to hourly OHLC bars...")
        df = resample_to_hourly_ohlc(df)
        
        if len(df) < 100:
            print(f"  ⚠️ Not enough hourly bars: {len(df)} (need 100+)")
            return False
        
        print(f"  ✅ Created {len(df):,} hourly bars")
        
        # Generate technical indicators
        print(f"  🔧 Generating features...")
        
        # Price-based features
        df['returns'] = df['close'].pct_change()
        df['log_returns'] = np.log(df['close'] / df['close'].shift(1))
        df['price_range'] = df['high'] - df['low']
        df['price_change'] = df['close'] - df['open']
        df['price_position'] = (df['close'] - df['low']) / (df['high'] - df['low'] + 0.0001)
        
        # Moving averages
        for period in [5, 10, 20, 50]:
            df[f'sma_{period}'] = ta.trend.sma_indicator(df['close'], window=period)
            df[f'ema_{period}'] = ta.trend.ema_indicator(df['close'], window=period)
        
        # RSI
        df['rsi'] = ta.momentum.RSIIndicator(df['close'], window=14).rsi()
        
        # MACD
        macd = ta.trend.MACD(df['close'])
        df['macd'] = macd.macd()
        df['macd_signal'] = macd.macd_signal()
        df['macd_diff'] = macd.macd_diff()
        
        # Bollinger Bands
        bb = ta.volatility.BollingerBands(df['close'])
        df['bb_high'] = bb.bollinger_hband()
        df['bb_low'] = bb.bollinger_lband()
        df['bb_mid'] = bb.bollinger_mavg()
        df['bb_width'] = df['bb_high'] - df['bb_low']
        df['bb_position'] = (df['close'] - df['bb_low']) / (df['bb_width'] + 0.0001)
        
        # ATR
        df['atr'] = ta.volatility.AverageTrueRange(df['high'], df['low'], df['close']).average_true_range()
        
        # Stochastic
        stoch = ta.momentum.StochasticOscillator(df['high'], df['low'], df['close'])
        df['stoch_k'] = stoch.stoch()
        df['stoch_d'] = stoch.stoch_signal()
        
        # Volume features
        if df['volume'].sum() > 0:
            df['volume_sma'] = df['volume'].rolling(20).mean()
            df['volume_ratio'] = df['volume'] / (df['volume_sma'] + 1)
        else:
            df['volume_sma'] = 0
            df['volume_ratio'] = 0
        
        # Target variable (next bar return)
        df['target'] = df['returns'].shift(-1)
        df['target_direction'] = (df['target'] > 0).astype(int)
        
        # Drop first 50 rows and last row
        df = df.iloc[50:-1]
        
        # Drop any remaining NaN
        df = df.dropna()
        
        if len(df) == 0:
            print(f"  ⚠️ No valid features after processing")
            return False
        
        print(f"  ✅ Generated {len(df.columns)} features for {len(df):,} samples")
        
        # Prepare for database
        features_data = []
        
        feature_cols = [
            'returns', 'log_returns', 'price_range', 'price_change', 'price_position',
            'sma_5', 'sma_10', 'sma_20', 'sma_50',
            'ema_5', 'ema_10', 'ema_20', 'ema_50',
            'rsi', 'macd', 'macd_signal', 'macd_diff',
            'bb_high', 'bb_low', 'bb_mid', 'bb_width', 'bb_position',
            'atr', 'stoch_k', 'stoch_d',
            'volume_sma', 'volume_ratio',
            'open', 'high', 'low', 'close', 'volume'
        ]
        
        for _, row in df.iterrows():
            features = {}
            for col in feature_cols:
                if col in row and pd.notna(row[col]):
                    features[col] = float(row[col])
            
            feature_dict = {
                'symbol': symbol,
                'timestamp': row['timestamp'].isoformat(),
                'feature_data': json.dumps(features),
                'target': float(row['target']) if pd.notna(row['target']) else None,
                'target_direction': int(row['target_direction']) if pd.notna(row['target_direction']) else None
            }
            features_data.append(feature_dict)
        
        # Insert in batches
        batch_size = 1000
        inserted = 0
        
        for i in range(0, len(features_data), batch_size):
            batch = features_data[i:i+batch_size]
            try:
                result = supabase.table('ml_training_features').upsert(
                    batch,
                    on_conflict='symbol,timestamp'
                ).execute()
                inserted += len(batch)
                print(f"    ✅ Batch {i//batch_size + 1}: {len(batch)} rows")
            except Exception as e:
                print(f"  ⚠️ Error inserting batch: {str(e)[:100]}")
        
        print(f"  ✅ Inserted {inserted:,} feature rows")
        return inserted > 0
        
    except Exception as e:
        print(f"  ❌ Error: {str(e)[:200]}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Generate features for all symbols"""
    
    print("\n" + "="*70)
    print("🧮 ML FEATURE GENERATION (WORKING VERSION)")
    print("="*70)
    print(f"Processing {len(SYMBOLS)} symbols...")
    print("Using price data to create hourly OHLC bars")
    
    success_count = 0
    failed_symbols = []
    
    for symbol in SYMBOLS:
        if generate_features_for_symbol(symbol):
            success_count += 1
        else:
            failed_symbols.append(symbol)
    
    print("\n" + "="*70)
    print("📊 FEATURE GENERATION COMPLETE")
    print("="*70)
    print(f"✅ Success: {success_count}/{len(SYMBOLS)} symbols")
    
    if failed_symbols:
        print(f"❌ Failed: {', '.join(failed_symbols)}")
    
    if success_count > 0:
        print(f"\n🎉 {success_count} symbols have ML features!")
        print("Ready for model training!")

if __name__ == "__main__":
    main()
