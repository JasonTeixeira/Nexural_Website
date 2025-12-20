#!/usr/bin/env python3
"""
DBN Data Processor - Production Ready (Fixed)
Converts large DBN files to aggregated OHLCV bars for ML training
Handles different data schemas (MBO, trades, OHLCV)
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import pandas as pd
from typing import List, Dict, Any

try:
    import databento as db
    from supabase import create_client, Client
except ImportError as e:
    print(f"❌ Missing required package: {e}")
    print("\nInstall with:")
    print("  pip install databento supabase")
    sys.exit(1)

# Configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
DBN_DIR = Path(__file__).parent.parent / 'data' / 'historical_30days'
BATCH_SIZE = 1000  # Insert 1000 rows at a time
AGGREGATION_INTERVAL = '5T'  # 5-minute bars

class DBNProcessor:
    """Processes DBN files and loads data into Supabase"""
    
    def __init__(self):
        """Initialize processor with database connection"""
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("Missing SUPABASE environment variables")
        
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.stats = {
            'files_processed': 0,
            'files_failed': 0,
            'files_skipped': 0,
            'total_rows': 0,
            'total_size_mb': 0
        }
    
    def process_dbn_file(self, dbn_path: Path) -> Dict[str, Any]:
        """
        Process a single DBN file
        
        Args:
            dbn_path: Path to DBN file
            
        Returns:
            Dict with processing statistics
        """
        print(f"\n{'='*70}")
        print(f"📊 Processing: {dbn_path.name}")
        print(f"{'='*70}")
        
        try:
            # Extract symbol from filename
            symbol = dbn_path.stem.split('_')[0].split('.')[0]
            print(f"Symbol: {symbol}")
            
            # Get file size
            file_size_mb = dbn_path.stat().st_size / (1024 * 1024)
            print(f"File size: {file_size_mb:.2f} MB")
            
            # Skip very small files (likely empty or test files)
            if file_size_mb < 0.001:
                print(f"⚠️  Skipping - file too small (likely empty)")
                self.stats['files_skipped'] += 1
                return {'success': False, 'skipped': True, 'reason': 'File too small'}
            
            # Skip VIX index files (not tradeable)
            if 'VIX_index' in dbn_path.name or 'VOL_' in dbn_path.name or '_proxy_' in dbn_path.name:
                print(f"⚠️  Skipping - VIX index/proxy file (not tradeable)")
                self.stats['files_skipped'] += 1
                return {'success': False, 'skipped': True, 'reason': 'VIX index/proxy'}
            
            # Read DBN file
            print("⬇️  Reading DBN file...")
            store = db.DBNStore.from_file(str(dbn_path))
            df = store.to_df()
            
            if len(df) == 0:
                print(f"⚠️  Skipping - no data in file")
                self.stats['files_skipped'] += 1
                return {'success': False, 'skipped': True, 'reason': 'No data'}
            
            print(f"✅ Loaded {len(df):,} records")
            
            # Aggregate to OHLCV bars
            print(f"🔄 Aggregating to {AGGREGATION_INTERVAL} bars...")
            bars = self.aggregate_to_ohlcv(df, symbol)
            
            if len(bars) == 0:
                print(f"⚠️  Skipping - no bars created after aggregation")
                self.stats['files_skipped'] += 1
                return {'success': False, 'skipped': True, 'reason': 'No bars after aggregation'}
            
            print(f"✅ Created {len(bars):,} OHLCV bars")
            
            # Save to database
            print("💾 Saving to Supabase...")
            rows_inserted = self.save_to_database(bars)
            
            print(f"✅ Inserted {rows_inserted:,} rows")
            
            # Update stats
            self.stats['files_processed'] += 1
            self.stats['total_rows'] += rows_inserted
            self.stats['total_size_mb'] += file_size_mb
            
            return {
                'success': True,
                'symbol': symbol,
                'records': len(df),
                'ohlcv_bars': len(bars),
                'rows_inserted': rows_inserted,
                'file_size_mb': file_size_mb
            }
            
        except Exception as e:
            print(f"❌ Error processing {dbn_path.name}: {e}")
            self.stats['files_failed'] += 1
            return {
                'success': False,
                'error': str(e)
            }
    
    def aggregate_to_ohlcv(self, df: pd.DataFrame, symbol: str) -> List[Dict[str, Any]]:
        """
        Aggregate data to OHLCV bars - handles multiple data schemas
        
        Args:
            df: DataFrame with market data
            symbol: Trading symbol
            
        Returns:
            List of OHLCV bar dictionaries
        """
        # Determine data type and extract price
        if 'bid_px_00' in df.columns and 'ask_px_00' in df.columns:
            # MBO data - use mid price
            df['price'] = (df['bid_px_00'] + df['ask_px_00']) / 2
            df['volume'] = df['bid_sz_00'] + df['ask_sz_00']
        elif 'price' in df.columns:
            # Trade data - use trade price
            df['volume'] = df.get('size', 1)
        elif 'close' in df.columns:
            # Already OHLCV data
            df['price'] = df['close']
            df['volume'] = df.get('volume', 0)
        else:
            # Try to find any price column
            price_cols = [col for col in df.columns if 'price' in col.lower() or 'px' in col.lower()]
            if price_cols:
                df['price'] = df[price_cols[0]]
                df['volume'] = df.get('size', df.get('volume', 1))
            else:
                raise ValueError(f"Cannot determine price column from: {df.columns.tolist()}")
        
        # Ensure timestamp column exists
        if 'ts_event' not in df.columns:
            if 'timestamp' in df.columns:
                df['ts_event'] = df['timestamp']
            else:
                raise ValueError(f"No timestamp column found in: {df.columns.tolist()}")
        
        # Set timestamp as index for resampling
        df['ts_event'] = pd.to_datetime(df['ts_event'])
        df.set_index('ts_event', inplace=True)
        
        # Resample to OHLCV bars
        ohlcv = pd.DataFrame()
        ohlcv['open'] = df['price'].resample('5min').first()
        ohlcv['high'] = df['price'].resample('5min').max()
        ohlcv['low'] = df['price'].resample('5min').min()
        ohlcv['close'] = df['price'].resample('5min').last()
        ohlcv['volume'] = df['volume'].resample('5min').sum()
        
        # Remove rows with NaN (no data in that interval)
        ohlcv = ohlcv.dropna()
        
        # Convert to list of dicts for database insertion
        bars = []
        for timestamp, row in ohlcv.iterrows():
            close_price = float(row['close'])
            bars.append({
                'timestamp': timestamp.isoformat(),
                'symbol': symbol,
                'price': close_price,  # Required field - use close price
                'open': float(row['open']),
                'high': float(row['high']),
                'low': float(row['low']),
                'close': close_price,
                'volume': int(row['volume']),
                'source': 'databento'
            })
        
        return bars
    
    def save_to_database(self, bars: List[Dict[str, Any]]) -> int:
        """
        Save OHLCV bars to Supabase in batches
        
        Args:
            bars: List of OHLCV bar dictionaries
            
        Returns:
            Number of rows inserted
        """
        total_inserted = 0
        
        # Insert in batches
        for i in range(0, len(bars), BATCH_SIZE):
            batch = bars[i:i + BATCH_SIZE]
            
            try:
                response = self.supabase.table('live_market_data').insert(batch).execute()
                total_inserted += len(batch)
                
                # Progress indicator
                progress = (i + len(batch)) / len(bars) * 100
                print(f"   Progress: {progress:.1f}% ({i + len(batch):,}/{len(bars):,})", end='\r')
                
            except Exception as e:
                print(f"\n⚠️  Error inserting batch {i}-{i+len(batch)}: {e}")
                # Continue with next batch
        
        print()  # New line after progress
        return total_inserted
    
    def process_all_files(self) -> None:
        """Process all DBN files in the directory"""
        print("\n" + "="*70)
        print("🚀 DBN DATA PROCESSOR - PRODUCTION MODE (FIXED)")
        print("="*70)
        print(f"Input directory: {DBN_DIR}")
        print(f"Aggregation: {AGGREGATION_INTERVAL} bars")
        print(f"Batch size: {BATCH_SIZE} rows")
        print("="*70)
        
        # Find all DBN files
        dbn_files = sorted(list(DBN_DIR.glob('*.dbn.zst')))
        
        if not dbn_files:
            print(f"\n❌ No DBN files found in {DBN_DIR}")
            return
        
        print(f"\nFound {len(dbn_files)} DBN files to process")
        
        # Process each file
        results = []
        for i, dbn_file in enumerate(dbn_files, 1):
            print(f"\n[{i}/{len(dbn_files)}]")
            result = self.process_dbn_file(dbn_file)
            results.append(result)
        
        # Print summary
        self.print_summary(results)
    
    def print_summary(self, results: List[Dict[str, Any]]) -> None:
        """Print processing summary"""
        print("\n" + "="*70)
        print("📊 PROCESSING SUMMARY")
        print("="*70)
        
        successful = [r for r in results if r.get('success')]
        skipped = [r for r in results if r.get('skipped')]
        failed = [r for r in results if not r.get('success') and not r.get('skipped')]
        
        print(f"✅ Successful: {len(successful)}/{len(results)}")
        print(f"⚠️  Skipped: {len(skipped)}/{len(results)}")
        print(f"❌ Failed: {len(failed)}/{len(results)}")
        print(f"📊 Total OHLCV bars: {self.stats['total_rows']:,}")
        print(f"💾 Total data processed: {self.stats['total_size_mb']:.2f} MB")
        
        if successful:
            print("\n📈 Processed symbols:")
            for result in successful:
                print(f"   • {result['symbol']}: {result['ohlcv_bars']:,} bars "
                      f"({result['records']:,} records)")
        
        if skipped:
            print("\n⚠️  Skipped files:")
            for result in skipped:
                print(f"   • Reason: {result.get('reason', 'Unknown')}")
        
        if failed:
            print("\n❌ Failed files:")
            for result in failed:
                print(f"   • Error: {result.get('error', 'Unknown')}")
        
        print("="*70)
        
        if successful:
            print("\n🎉 Processing complete!")
            print(f"\n✅ Successfully processed {len(successful)} symbols")
            print("\nNext steps:")
            print("1. Run multi-timeframe aggregation: python3 scripts/phase1-multi-timeframe-aggregation.py")
            print("2. Generate features: python3 scripts/phase1b-advanced-feature-engineering.py")
            print("3. Train models: cd ml_training && python3 train_pipeline.py --all-symbols")

def main():
    """Main execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Process DBN files to OHLCV bars')
    parser.add_argument('--symbol', type=str, help='Process only this symbol (e.g., ES)')
    args = parser.parse_args()
    
    try:
        processor = DBNProcessor()
        
        if args.symbol:
            # Process single symbol
            symbol_file = DBN_DIR / f"{args.symbol}.c.0_20250901_20251001.dbn.zst"
            if not symbol_file.exists():
                print(f"❌ File not found: {symbol_file}")
                sys.exit(1)
            
            print(f"\n🎯 Processing single symbol: {args.symbol}")
            result = processor.process_dbn_file(symbol_file)
            
            if result['success']:
                print(f"\n✅ {args.symbol} processed successfully!")
                print(f"   • {result['ohlcv_bars']:,} OHLCV bars created")
                print(f"   • {result['rows_inserted']:,} rows inserted to database")
            else:
                print(f"\n⚠️  {args.symbol} was skipped or failed")
                sys.exit(1)
        else:
            # Process all files
            processor.process_all_files()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Processing interrupted by user")
        sys.exit(1)
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
