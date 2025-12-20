#!/usr/bin/env python3
"""
Test ML signal generation for trained models
"""

import os
import sys
from datetime import datetime
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from supabase import create_client
import joblib
import json
import ta

# Load environment variables
load_dotenv('.env.local')

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials")
    sys.exit(1)

# Connect to Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Symbols with trained models
TRAINED_SYMBOLS = ['6E', '6J', '6A', '6C', '6S', 'VX']

def get_latest_data(symbol):
    """Get latest data for prediction"""
    
    # Fetch latest 100 bars with OHLC
    result = supabase.table('live_market_data')\
        .select('*')\
        .eq('symbol', symbol)\
        .not_.is_('open', 'null')\
        .order('timestamp', desc=True)\
        .limit(100)\
        .execute()
    
    if not result.data:
        return None
    
    df = pd.DataFrame(result.data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp')
    
    # Ensure numeric columns
    for col in ['open', 'high', 'low', 'close', 'volume']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    return df

def prepare_features(df):
    """Prepare features for prediction"""
    
    # Generate same features as training
    df['returns'] = df['close'].pct_change()
    df['log_returns'] = np.log(df['close'] / df['close'].shift(1))
    df['price_range'] = (df['high'] - df['low']) / df['close']
    df['price_change'] = (df['close'] - df['open']) / df['open']
    
    df['sma_5'] = df['close'].rolling(5).mean()
    df['sma_20'] = df['close'].rolling(20).mean()
    df['sma_ratio'] = df['sma_5'] / df['sma_20']
    
    df['rsi'] = ta.momentum.RSIIndicator(df['close'], window=14).rsi()
    df['volume_ratio'] = df['volume'] / df['volume'].rolling(20).mean()
    df['volatility'] = df['returns'].rolling(20).std()
    
    # Select features
    feature_cols = ['returns', 'log_returns', 'price_range', 'price_change',
                   'sma_ratio', 'rsi', 'volume_ratio', 'volatility']
    
    # Get last row with all features
    df = df.dropna()
    
    if len(df) == 0:
        return None
    
    return df[feature_cols].iloc[-1:].values

def generate_signal(symbol):
    """Generate trading signal for a symbol"""
    
    print(f"\n📊 Generating signal for {symbol}...")
    
    # Load model
    model_path = f'ml_models/{symbol}_model.pkl'
    if not os.path.exists(model_path):
        print(f"  ❌ Model not found: {model_path}")
        return None
    
    model = joblib.load(model_path)
    
    # Get latest data
    df = get_latest_data(symbol)
    if df is None:
        print(f"  ❌ No data available")
        return None
    
    # Prepare features
    features = prepare_features(df)
    if features is None:
        print(f"  ❌ Could not prepare features")
        return None
    
    # Make prediction
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0]
    
    # Get latest price info
    latest = df.iloc[-1]
    
    signal = {
        'symbol': symbol,
        'timestamp': latest['timestamp'].isoformat(),
        'price': float(latest['close']),
        'prediction': 'LONG' if prediction == 1 else 'SHORT',
        'confidence': float(max(probability)),
        'probability_up': float(probability[1]),
        'probability_down': float(probability[0])
    }
    
    # Determine signal strength
    confidence = signal['confidence']
    if confidence > 0.65:
        signal['strength'] = 'STRONG'
        signal['emoji'] = '🔥'
    elif confidence > 0.55:
        signal['strength'] = 'MODERATE'
        signal['emoji'] = '✅'
    else:
        signal['strength'] = 'WEAK'
        signal['emoji'] = '⚠️'
    
    return signal

def format_discord_message(signals):
    """Format signals for Discord"""
    
    message = "```\n"
    message += "🤖 ML TRADING SIGNALS\n"
    message += f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} EST\n"
    message += "=" * 40 + "\n\n"
    
    for signal in signals:
        if signal:
            message += f"{signal['emoji']} {signal['symbol']}: {signal['prediction']}\n"
            message += f"   Price: ${signal['price']:.2f}\n"
            message += f"   Confidence: {signal['confidence']:.1%}\n"
            message += f"   Strength: {signal['strength']}\n"
            message += "-" * 30 + "\n"
    
    message += "\n📊 Model Performance:\n"
    
    # Load training results
    with open('ml_models/training_results.json', 'r') as f:
        results = json.load(f)
    
    for symbol, accuracy in results['results'].items():
        message += f"   {symbol}: {accuracy:.1%} accuracy\n"
    
    message += "\n⚠️ Use signals at your own risk!\n"
    message += "```"
    
    return message

def main():
    """Generate signals for all trained models"""
    
    print("\n" + "="*70)
    print("🚀 ML SIGNAL GENERATION TEST")
    print("="*70)
    
    signals = []
    
    for symbol in TRAINED_SYMBOLS:
        try:
            signal = generate_signal(symbol)
            if signal:
                signals.append(signal)
                print(f"  ✅ {signal['symbol']}: {signal['prediction']} "
                      f"({signal['confidence']:.1%} confidence)")
            else:
                print(f"  ⚠️ {symbol}: Could not generate signal")
        except Exception as e:
            print(f"  ❌ {symbol}: Error - {str(e)[:100]}")
    
    if signals:
        print("\n" + "="*70)
        print("📨 DISCORD MESSAGE PREVIEW")
        print("="*70)
        
        discord_message = format_discord_message(signals)
        print(discord_message)
        
        # Save signals
        with open('ml_models/latest_signals.json', 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'signals': signals
            }, f, indent=2)
        
        print("\n✅ Signals saved to ml_models/latest_signals.json")
        print("\n🎉 ML signals generated successfully!")
        print("\nNext steps:")
        print("1. Set up Discord webhook in lib/discord-webhooks-18-symbols.ts")
        print("2. Deploy to production: vercel --prod")
        print("3. Signals will post automatically every hour")
    else:
        print("\n⚠️ No signals could be generated")

if __name__ == "__main__":
    main()
