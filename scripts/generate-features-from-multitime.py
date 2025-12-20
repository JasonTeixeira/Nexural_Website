#!/usr/bin/env python3
"""
Generate ML features from multi_timeframe_data table
Reads processed OHLCV bars and creates technical indicators
"""

import os
import sys
from datetime import datetime
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

# All symbols to process
SYMBOLS = [
    'ES', 'NQ', 'RTY', 'YM',  # Equity indices
    'CL', 'NG',  # Energy
    'GC', 'SI', 'HG',  # Metals
    'BTC', 'ETH',  # Crypto
    'ZN',  # Bonds
    '6E', '6J', '6A', '6C', '6S',  # Currencies
    'ZC', 'ZS', 'ZW',  # Agriculture
    'VX',  # Volatility
]

def fetch_ohlcv_data(symbol, timeframe='1H'):
    """Fetch OHLCV data from multi_timeframe_data table"""
    print(f"  📥 Fetching {timeframe} data...")
    
    all_data = []
    limit = 10000
    offset = 0
    
    while True:
        result = supabase.table('multi_timeframe_data')\
            .select('*')\
            .eq('symbol', symbol)\
            .eq('timeframe', timeframe)\
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

def generate_technical_indicators(df):
    """Generate comprehensive technical indicators"""
    
    # Ensure numeric types
    for col in ['open', 'high', 'low', 'close', 'volume']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Price-based features
    df['returns'] = df['close'].pct_change()
    df['log_returns'] = np.log(df['close'] / df['close'].shift(1))
    df['price_range'] = df['high'] - df['low']
    df['price_change'] = df['close'] - df['open']
    df['price_position'] = (df['close'] - df['low']) / (df['high'] - df['low'] + 0.0001)
    
    # Moving averages
    for period in [5, 10, 20, 50, 100, 200]:
        df[f'sma_{period}'] = ta.trend.sma_indicator(df['close'], window=period)
        df[f'ema_{period}'] = ta.trend.ema_indicator(df['close'], window=period)
    
    # RSI
    df['rsi_14'] = ta.momentum.RSIIndicator(df['close'], window=14).rsi()
    df['rsi_7'] = ta.momentum.RSIIndicator(df['close'], window=7).rsi()
    df['rsi_21'] = ta.momentum.RSIIndicator(df['close'], window=21).rsi()
    
    # MACD
    macd = ta.trend.MACD(df['close'])
    df['macd'] = macd.macd()
    df['macd_signal'] = macd.macd_signal()
    df['macd_diff'] = macd.macd_diff()
    
    # Bollinger Bands
    bb = ta.volatility.BollingerBands(df['close'], window=20, window_dev=2)
    df['bb_high'] = bb.bollinger_hband()
    df['bb_low'] = bb.bollinger_lband()
    df['bb_mid'] = bb.bollinger_mavg()
    df['bb_width'] = df['bb_high'] - df['bb_low']
    df['bb_position'] = (df['close'] - df['bb_low']) / (df['bb_width'] + 0.0001)
    
    # ATR (Average True Range)
    df['atr_14'] = ta.volatility.AverageTrueRange(df['high'], df['low'], df['close'], window=14).average_true_range()
    df['atr_7'] = ta.volatility.AverageTrueRange(df['high'], df['low'], df['close'], window=7).average_true_range()
    
    # Stochastic Oscillator
    stoch = ta.momentum.StochasticOscillator(df['high'], df['low'], df['close'])
    df['stoch_k'] = stoch.stoch()
    df['stoch_d'] = stoch.stoch_signal()
    
    # ADX (Average Directional Index)
    adx = ta.trend.ADXIndicator(df['high'], df['low'], df['close'])
    df['adx'] = adx.adx()
    df['adx_pos'] = adx.adx_pos()
    df['adx_neg'] = adx.adx_neg()
    
    # CCI (Commodity Channel Index)
    df['cci'] = ta.trend.CCIIndicator(df['high'], df['low'], df['close']).cci()
    
    # Volume features
    if df['volume'].sum() > 0:
        df['volume_sma_20'] = df['volume'].rolling(20).mean()
        df['volume_ratio'] = df['volume'] / (df['volume_sma_20'] + 1)
        df['volume_change'] = df['volume'].pct_change()
        
        # On-Balance Volume
        df['obv'] = ta.volume.OnBalanceVolumeIndicator(df['close'], df['volume']).on_balance_volume()
    else:
        df['volume_sma_20'] = 0
        df['volume_ratio'] = 0
        df['volume_change'] = 0
        df['obv'] = 0
    
    # Momentum indicators
    df['roc_10'] = ta.momentum.ROCIndicator(df['close'], window=10).roc()
    df['roc_20'] = ta.momentum.ROCIndicator(df['close'], window=20).roc()
    
    # Williams %R
    df['williams_r'] = ta.momentum.WilliamsRIndicator(df['high'], df['low'], df['close']).williams_r()
    
    # Target variable (next bar return)
    df['target'] = df['returns'].shift(-1)
    df['target_direction'] = (df['target'] > 0).astype(int)
    
    return df

def generate_features_for_symbol(symbol, timeframe='1H'):
    """Generate ML features for a single symbol"""
    
    print(f"\n{'='*70}")
    print(f"📊 Processing {symbol} ({timeframe})")
    print(f"{'='*70}")
    
    try:
        # Fetch OHLCV data
        data = fetch_ohlcv_data(symbol, timeframe)
        
        if not data:
            print(f"  ❌ No data found for {symbol}")
            return False
        
        df = pd.DataFrame(data)
        print(f"  ✅ Loaded {len(df):,} bars")
        
        if len(df) < 200:
            print(f"  ⚠️  Not enough bars: {len(df)} (need 200+)")
            return False
        
        # Convert timestamp
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Generate technical indicators
        print(f"  🔧 Generating technical indicators...")
        df = generate_technical_indicators(df)
        
        # Drop first 200 rows (for indicator warmup) and last row (no target)
        df = df.iloc[200:-1]
        
        # Drop any remaining NaN
        df = df.dropna()
        
        if len(df) == 0:
            print(f"  ⚠️  No valid features after processing")
            return False
        
        print(f"  ✅ Generated {len(df.columns)} features for {len(df):,} samples")
        
        # Prepare for database
        features_data = []
        
        feature_cols = [
            'returns', 'log_returns', 'price_range', 'price_change', 'price_position',
            'sma_5', 'sma_10', 'sma_20', 'sma_50', 'sma_100', 'sma_200',
            'ema_5', 'ema_10', 'ema_20', 'ema_50', 'ema_100', 'ema_200',
            'rsi_7', 'rsi_14', 'rsi_21',
            'macd', 'macd_signal', 'macd_diff',
            'bb_high', 'bb_low', 'bb_mid', 'bb_width', 'bb_position',
            'atr_7', 'atr_14',
            'stoch_k', 'stoch_d',
            'adx', 'adx_pos', 'adx_neg',
            'cci', 'williams_r',
            'roc_10', 'roc_20',
            'volume_sma_20', 'volume_ratio', 'volume_change', 'obv',
            'open', 'high', 'low', 'close', 'volume'
        ]
        
        for _, row in df.iterrows():
            features = {}
            for col in feature_cols:
                if col in row and pd.notna(row[col]):
                    val = row[col]
                    # Handle infinity values
                    if np.isinf(val):
                        val = 0.0
                    features[col] = float(val)
            
            feature_dict = {
                'symbol': symbol,
                'timestamp': row['timestamp'].isoformat(),
                'timeframe': timeframe,
                'feature_data': json.dumps(features),
                'target': float(row['target']) if pd.notna(row['target']) and not np.isinf(row['target']) else None,
                'target_direction': int(row['target_direction']) if pd.notna(row['target_direction']) else None
            }
            features_data.append(feature_dict)
        
        # Insert in batches
        batch_size = 1000
        inserted = 0
        
        print(f"  💾 Saving to database...")
        for i in range(0, len(features_data), batch_size):
            batch = features_data[i:i+batch_size]
            try:
                result = supabase.table('ml_training_features').upsert(
                    batch,
                    on_conflict='symbol,timestamp,timeframe'
                ).execute()
                inserted += len(batch)
                progress = (i + len(batch)) / len(features_data) * 100
                print(f"    Progress: {progress:.0f}% ({inserted:,}/{len(features_data):,})", end='\r')
            except Exception as e:
                print(f"\n  ⚠️  Error inserting batch: {str(e)[:100]}")
        
        print(f"\n  ✅ Inserted {inserted:,} feature rows")
        return inserted > 0
        
    except Exception as e:
        print(f"  ❌ Error: {str(e)[:200]}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Generate features for all symbols"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate ML features from multi_timeframe_data')
    parser.add_argument('--symbol', type=str, help='Process only this symbol')
    parser.add_argument('--timeframe', type=str, default='1H', help='Timeframe to use (default: 1H)')
    args = parser.parse_args()
    
    print("\n" + "="*70)
    print("🧮 ML FEATURE GENERATION FROM MULTI-TIMEFRAME DATA")
    print("="*70)
    print(f"Source table: multi_timeframe_data")
    print(f"Target table: ml_training_features")
    print(f"Timeframe: {args.timeframe}")
    
    if args.symbol:
        symbols = [args.symbol]
        print(f"Processing: {args.symbol}")
    else:
        symbols = SYMBOLS
        print(f"Processing: {len(symbols)} symbols")
    
    print("="*70)
    
    success_count = 0
    failed_symbols = []
    
    for symbol in symbols:
        if generate_features_for_symbol(symbol, args.timeframe):
            success_count += 1
        else:
            failed_symbols.append(symbol)
    
    print("\n" + "="*70)
    print("📊 FEATURE GENERATION COMPLETE")
    print("="*70)
    print(f"✅ Success: {success_count}/{len(symbols)} symbols")
    
    if failed_symbols:
        print(f"❌ Failed: {', '.join(failed_symbols)}")
    
    if success_count > 0:
        print(f"\n🎉 {success_count} symbols have ML features!")
        print("\nNext steps:")
        print("1. Train models: cd ml_training && python3 train_pipeline.py --symbol ES")
        print("2. Or use Phase 3: python3 scripts/phase3-ml-model-training.py")
    
    print("="*70)

if __name__ == "__main__":
    main()
