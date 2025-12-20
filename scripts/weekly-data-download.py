#!/usr/bin/env python3
"""
Weekly Data Download Script
Downloads last 7 days of data from Databento for all symbols
Optimized for ML training pipeline
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import databento as db
from supabase import create_client, Client
import pandas as pd
from typing import List, Dict

# Configuration
SYMBOLS = [
    'ES.c.0', 'NQ.c.0', 'RTY.c.0', 'YM.c.0',  # Equity Indices
    'CL.c.0', 'GC.c.0', 'SI.c.0',              # Energy & Metals
    'BTC.c.0', 'ETH.c.0',                      # Crypto
    'ZN.c.0',                                   # Bonds
    '6E.c.0', '6J.c.0',                        # Currencies (EUR, JPY)
    'NG.c.0', 'HG.c.0',                        # Energy & Metals
    'ZC.c.0', 'ZS.c.0', 'ZW.c.0',             # Agriculture
    'VX.c.0',                                   # Volatility
    '6A.c.0', '6C.c.0', '6S.c.0'              # Currencies (AUD, CAD, CHF)
]

DATASET = 'GLBX.MDP3'
SCHEMA = 'ohlcv-1m'  # Get 1-minute bars directly from Databento
AGGREGATION_INTERVAL = '5T'  # Aggregate to 5-minute bars

class WeeklyDataDownloader:
    """Downloads and processes weekly market data"""
    
    def __init__(self):
        self.databento_key = os.getenv('DATABENTO_API_KEY')
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not all([self.databento_key, self.supabase_url, self.supabase_key]):
            raise ValueError("Missing required environment variables")
        
        self.client = db.Historical(self.databento_key)
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        self.stats = {
            'symbols_processed': 0,
            'symbols_failed': 0,
            'total_bars': 0,
            'total_records': 0,
            'errors': []
        }
    
    def download_symbol(self, symbol: str, start_date: datetime, end_date: datetime) -> pd.DataFrame:
        """Download data for a single symbol"""
        
        print(f"\n📥 Downloading {symbol}...")
        print(f"   Period: {start_date.date()} to {end_date.date()}")
        
        try:
            # Download 1-minute OHLCV data
            data = self.client.timeseries.get_range(
                dataset=DATASET,
                symbols=[symbol],
                schema=SCHEMA,
                start=start_date,
                end=end_date,
                stype_in='continuous'
            )
            
            # Convert to DataFrame
            df = data.to_df()
            
            if df.empty:
                print(f"   ⚠️  No data returned for {symbol}")
                return pd.DataFrame()
            
            print(f"   ✓ Downloaded {len(df):,} 1-minute bars")
            
            # Aggregate to 5-minute bars
            df_5min = self.aggregate_to_5min(df, symbol)
            
            print(f"   ✓ Aggregated to {len(df_5min):,} 5-minute bars")
            
            return df_5min
            
        except Exception as e:
            print(f"   ❌ Error downloading {symbol}: {e}")
            self.stats['errors'].append(f"{symbol}: {str(e)}")
            return pd.DataFrame()
    
    def aggregate_to_5min(self, df: pd.DataFrame, symbol: str) -> pd.DataFrame:
        """Aggregate 1-minute bars to 5-minute bars"""
        
        # Ensure timestamp is datetime
        if 'ts_event' in df.columns:
            df['timestamp'] = pd.to_datetime(df['ts_event'])
        else:
            df['timestamp'] = df.index
        
        df.set_index('timestamp', inplace=True)
        
        # Aggregate OHLCV
        agg_dict = {
            'open': 'first',
            'high': 'max',
            'low': 'min',
            'close': 'last',
            'volume': 'sum'
        }
        
        df_5min = df.resample(AGGREGATION_INTERVAL).agg(agg_dict)
        
        # Remove rows with NaN (no data in that period)
        df_5min = df_5min.dropna()
        
        # Add symbol
        df_5min['symbol'] = symbol.replace('.c.0', '')
        
        # Reset index to get timestamp as column
        df_5min = df_5min.reset_index()
        
        return df_5min
    
    def save_to_database(self, df: pd.DataFrame, symbol: str) -> bool:
        """Save OHLCV data to Supabase"""
        
        if df.empty:
            return False
        
        print(f"   💾 Saving to database...")
        
        try:
            # Prepare data for insertion
            records = []
            for _, row in df.iterrows():
                record = {
                    'symbol': symbol.replace('.c.0', ''),
                    'timestamp': row['timestamp'].isoformat(),
                    'open': float(row['open']),
                    'high': float(row['high']),
                    'low': float(row['low']),
                    'close': float(row['close']),
                    'volume': int(row['volume'])
                }
                records.append(record)
            
            # Insert in batches of 1000
            batch_size = 1000
            for i in range(0, len(records), batch_size):
                batch = records[i:i + batch_size]
                
                response = self.supabase.table('live_market_data').upsert(
                    batch,
                    on_conflict='symbol,timestamp'
                ).execute()
                
                if hasattr(response, 'error') and response.error:
                    print(f"   ❌ Database error: {response.error}")
                    return False
            
            print(f"   ✓ Saved {len(records):,} bars to database")
            self.stats['total_bars'] += len(records)
            
            return True
            
        except Exception as e:
            print(f"   ❌ Error saving to database: {e}")
            self.stats['errors'].append(f"{symbol} save: {str(e)}")
            return False
    
    def download_all_symbols(self, days_back: int = 7) -> Dict:
        """Download data for all symbols"""
        
        print("\n" + "=" * 70)
        print("📥 WEEKLY DATA DOWNLOAD")
        print("=" * 70)
        print(f"Symbols: {len(SYMBOLS)}")
        print(f"Days back: {days_back}")
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70)
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        for i, symbol in enumerate(SYMBOLS, 1):
            print(f"\n[{i}/{len(SYMBOLS)}] Processing {symbol}")
            
            # Download data
            df = self.download_symbol(symbol, start_date, end_date)
            
            if not df.empty:
                # Save to database
                if self.save_to_database(df, symbol):
                    self.stats['symbols_processed'] += 1
                else:
                    self.stats['symbols_failed'] += 1
            else:
                self.stats['symbols_failed'] += 1
        
        # Print summary
        self.print_summary()
        
        return self.stats
    
    def print_summary(self):
        """Print download summary"""
        
        print("\n" + "=" * 70)
        print("📊 DOWNLOAD SUMMARY")
        print("=" * 70)
        print(f"✅ Successful: {self.stats['symbols_processed']}/{len(SYMBOLS)}")
        print(f"❌ Failed: {self.stats['symbols_failed']}/{len(SYMBOLS)}")
        print(f"📊 Total bars: {self.stats['total_bars']:,}")
        print(f"⏱️  Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        if self.stats['errors']:
            print(f"\n⚠️  Errors ({len(self.stats['errors'])}):")
            for error in self.stats['errors'][:5]:  # Show first 5
                print(f"   • {error}")
            if len(self.stats['errors']) > 5:
                print(f"   ... and {len(self.stats['errors']) - 5} more")
        
        print("=" * 70)

def main():
    """Main execution"""
    
    # Check environment variables
    required_vars = ['DATABENTO_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("   Load your .env.local file first:")
        print("   export $(cat .env.local | grep -v '^#' | xargs)")
        sys.exit(1)
    
    try:
        downloader = WeeklyDataDownloader()
        stats = downloader.download_all_symbols(days_back=7)
        
        # Exit with success if at least 80% succeeded
        success_rate = stats['symbols_processed'] / len(SYMBOLS)
        if success_rate >= 0.8:
            print("\n✅ Weekly data download completed successfully!")
            sys.exit(0)
        else:
            print(f"\n⚠️  Weekly data download completed with issues (success rate: {success_rate:.1%})")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
