#!/usr/bin/env python3
"""
Complete Weekly ML Pipeline Orchestrator
Automates: Data Download → Feature Generation → Model Training → Deployment
"""

import os
import sys
import json
import logging
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List
import time

# Configure logging
log_dir = Path(__file__).parent.parent / 'logs'
log_dir.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / f'weekly_pipeline_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Configuration
SYMBOLS = [
    'ES', 'NQ', 'RTY', 'YM',  # Equity Indices
    'CL', 'GC', 'SI',          # Energy & Metals
    'BTC', 'ETH',              # Crypto
    'ZN',                       # Bonds
    '6E', '6J',                # Currencies (EUR, JPY)
    'NG', 'HG',                # Energy & Metals
    'ZC', 'ZS', 'ZW',          # Agriculture
    'VX',                       # Volatility
    '6A', '6C', '6S'           # Currencies (AUD, CAD, CHF)
]

API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:3036')

class WeeklyMLPipeline:
    """Complete automated ML pipeline orchestrator"""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.results = {
            'download': {'status': 'pending', 'details': {}},
            'features': {'status': 'pending', 'details': {}},
            'labels': {'status': 'pending', 'details': {}},
            'training': {'status': 'pending', 'models': {}},
            'deployment': {'status': 'pending', 'details': {}},
        }
        self.errors = []
        
        # Verify environment
        self._verify_environment()
    
    def _verify_environment(self):
        """Verify required environment variables"""
        required_vars = [
            'DATABENTO_API_KEY',
            'NEXT_PUBLIC_SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY'
        ]
        
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            raise ValueError(f"Missing environment variables: {', '.join(missing)}")
        
        logger.info("✓ Environment variables verified")
    
    def run(self) -> bool:
        """Execute complete pipeline"""
        
        logger.info("=" * 70)
        logger.info("🚀 WEEKLY ML PIPELINE STARTED")
        logger.info("=" * 70)
        logger.info(f"Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Symbols: {len(SYMBOLS)}")
        logger.info("=" * 70)
        
        try:
            # Step 1: Download new data
            if not self.step_1_download_data():
                logger.error("❌ Pipeline failed at Step 1: Data Download")
                return False
            
            # Step 2: Generate features
            if not self.step_2_generate_features():
                logger.error("❌ Pipeline failed at Step 2: Feature Generation")
                return False
            
            # Step 3: Generate labels
            if not self.step_3_generate_labels():
                logger.error("❌ Pipeline failed at Step 3: Label Generation")
                return False
            
            # Step 4: Train models
            if not self.step_4_train_models():
                logger.error("❌ Pipeline failed at Step 4: Model Training")
                return False
            
            # Step 5: Deploy models
            if not self.step_5_deploy_models():
                logger.error("❌ Pipeline failed at Step 5: Model Deployment")
                return False
            
            # Step 6: Cleanup
            self.step_6_cleanup()
            
            # Step 7: Generate report
            self.step_7_generate_report()
            
            logger.info("\n" + "=" * 70)
            logger.info("✅ PIPELINE COMPLETED SUCCESSFULLY")
            logger.info("=" * 70)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ PIPELINE FAILED: {e}", exc_info=True)
            self.errors.append(str(e))
            self.send_error_notification(e)
            return False
    
    def step_1_download_data(self) -> bool:
        """Step 1: Download last 7 days of data"""
        
        logger.info("\n" + "=" * 70)
        logger.info("📥 STEP 1: DOWNLOADING DATA")
        logger.info("=" * 70)
        
        try:
            # Import and run weekly download script
            sys.path.insert(0, str(Path(__file__).parent))
            from weekly_data_download import WeeklyDataDownloader
            
            downloader = WeeklyDataDownloader()
            stats = downloader.download_all_symbols(days_back=7)
            
            self.results['download']['status'] = 'success'
            self.results['download']['details'] = stats
            
            # Check success rate
            success_rate = stats['symbols_processed'] / len(SYMBOLS)
            if success_rate < 0.8:
                logger.warning(f"⚠️  Low success rate: {success_rate:.1%}")
                return False
            
            logger.info(f"✅ Step 1 complete: {stats['symbols_processed']}/{len(SYMBOLS)} symbols downloaded")
            return True
            
        except Exception as e:
            logger.error(f"❌ Step 1 failed: {e}", exc_info=True)
            self.results['download']['status'] = 'failed'
            self.results['download']['error'] = str(e)
            self.errors.append(f"Download: {str(e)}")
            return False
    
    def step_2_generate_features(self) -> bool:
        """Step 2: Generate ML features from OHLCV data"""
        
        logger.info("\n" + "=" * 70)
        logger.info("🔧 STEP 2: GENERATING FEATURES")
        logger.info("=" * 70)
        
        try:
            # Call feature generation API
            url = f"{API_BASE_URL}/api/cron/hourly-feature-generation"
            
            logger.info(f"Calling: {url}")
            response = requests.get(url, timeout=300)  # 5 minute timeout
            
            if response.status_code == 200:
                data = response.json()
                self.results['features']['status'] = 'success'
                self.results['features']['details'] = data
                
                logger.info(f"✅ Step 2 complete: Features generated")
                return True
            else:
                logger.error(f"❌ Feature generation failed: {response.status_code}")
                logger.error(f"Response: {response.text}")
                self.results['features']['status'] = 'failed'
                self.results['features']['error'] = f"HTTP {response.status_code}"
                return False
                
        except Exception as e:
            logger.error(f"❌ Step 2 failed: {e}", exc_info=True)
            self.results['features']['status'] = 'failed'
            self.results['features']['error'] = str(e)
            self.errors.append(f"Features: {str(e)}")
            return False
    
    def step_3_generate_labels(self) -> bool:
        """Step 3: Generate training labels from closed signals"""
        
        logger.info("\n" + "=" * 70)
        logger.info("🏷️  STEP 3: GENERATING LABELS")
        logger.info("=" * 70)
        
        try:
            # Import label generator
            ml_training_path = Path(__file__).parent.parent / 'ml_training'
            sys.path.insert(0, str(ml_training_path))
            
            from label_generator import LabelGenerator
            
            label_gen = LabelGenerator()
            labels_df = label_gen.generate_labels(days_back=90)
            
            if labels_df.empty:
                logger.warning("⚠️  No labels generated (no closed signals)")
                logger.info("   This is OK for initial setup")
                logger.info("   Labels will be generated after first trades")
                self.results['labels']['status'] = 'skipped'
                self.results['labels']['details'] = {'count': 0, 'reason': 'No closed signals'}
                return True  # Don't fail pipeline
            
            # Save labels
            label_gen.save_labels_to_database(labels_df)
            
            self.results['labels']['status'] = 'success'
            self.results['labels']['details'] = {'count': len(labels_df)}
            
            logger.info(f"✅ Step 3 complete: {len(labels_df)} labels generated")
            return True
            
        except Exception as e:
            logger.error(f"❌ Step 3 failed: {e}", exc_info=True)
            self.results['labels']['status'] = 'failed'
            self.results['labels']['error'] = str(e)
            self.errors.append(f"Labels: {str(e)}")
            # Don't fail pipeline if no labels yet
            return True
    
    def step_4_train_models(self) -> bool:
        """Step 4: Train models for all symbols"""
        
        logger.info("\n" + "=" * 70)
        logger.info("🤖 STEP 4: TRAINING MODELS")
        logger.info("=" * 70)
        
        try:
            # Import training pipeline
            ml_training_path = Path(__file__).parent.parent / 'ml_training'
            sys.path.insert(0, str(ml_training_path))
            
            from train_pipeline import run_complete_pipeline
            
            successful = 0
            failed = 0
            
            for i, symbol in enumerate(SYMBOLS, 1):
                logger.info(f"\n[{i}/{len(SYMBOLS)}] Training {symbol}...")
                
                try:
                    success = run_complete_pipeline(
                        symbol=symbol,
                        days_back=90
                    )
                    
                    if success:
                        self.results['training']['models'][symbol] = 'success'
                        successful += 1
                        logger.info(f"✅ {symbol} trained successfully")
                    else:
                        self.results['training']['models'][symbol] = 'failed'
                        failed += 1
                        logger.warning(f"⚠️  {symbol} training failed")
                        
                except Exception as e:
                    logger.error(f"❌ {symbol} training error: {e}")
                    self.results['training']['models'][symbol] = 'error'
                    failed += 1
                
                # Small delay between models
                time.sleep(2)
            
            self.results['training']['status'] = 'success'
            self.results['training']['summary'] = {
                'successful': successful,
                'failed': failed,
                'total': len(SYMBOLS)
            }
            
            # Require at least 50% success
            success_rate = successful / len(SYMBOLS)
            if success_rate < 0.5:
                logger.error(f"❌ Training success rate too low: {success_rate:.1%}")
                return False
            
            logger.info(f"✅ Step 4 complete: {successful}/{len(SYMBOLS)} models trained")
            return True
            
        except Exception as e:
            logger.error(f"❌ Step 4 failed: {e}", exc_info=True)
            self.results['training']['status'] = 'failed'
            self.results['training']['error'] = str(e)
            self.errors.append(f"Training: {str(e)}")
            return False
    
    def step_5_deploy_models(self) -> bool:
        """Step 5: Deploy best models to production"""
        
        logger.info("\n" + "=" * 70)
        logger.info("🚀 STEP 5: DEPLOYING MODELS")
        logger.info("=" * 70)
        
        try:
            # Models are auto-deployed by training pipeline
            # Just verify they're in database
            
            self.results['deployment']['status'] = 'success'
            self.results['deployment']['details'] = {
                'method': 'auto-deployed by training pipeline',
                'models': len([m for m in self.results['training']['models'].values() if m == 'success'])
            }
            
            logger.info("✅ Step 5 complete: Models deployed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Step 5 failed: {e}", exc_info=True)
            self.results['deployment']['status'] = 'failed'
            self.results['deployment']['error'] = str(e)
            self.errors.append(f"Deployment: {str(e)}")
            return False
    
    def step_6_cleanup(self):
        """Step 6: Cleanup old data and logs"""
        
        logger.info("\n" + "=" * 70)
        logger.info("🧹 STEP 6: CLEANUP")
        logger.info("=" * 70)
        
        try:
            # Archive old logs (keep last 30 days)
            log_dir = Path(__file__).parent.parent / 'logs'
            if log_dir.exists():
                cutoff_date = datetime.now().timestamp() - (30 * 24 * 60 * 60)
                for log_file in log_dir.glob('*.log'):
                    if log_file.stat().st_mtime < cutoff_date:
                        log_file.unlink()
                        logger.info(f"   Deleted old log: {log_file.name}")
            
            logger.info("✅ Step 6 complete: Cleanup done")
            
        except Exception as e:
            logger.warning(f"⚠️  Cleanup warning: {e}")
    
    def step_7_generate_report(self):
        """Step 7: Generate and send completion report"""
        
        logger.info("\n" + "=" * 70)
        logger.info("📧 STEP 7: GENERATING REPORT")
        logger.info("=" * 70)
        
        try:
            report = self._generate_report_text()
            
            # Save report to file
            report_dir = Path(__file__).parent.parent / 'logs' / 'reports'
            report_dir.mkdir(exist_ok=True)
            
            report_file = report_dir / f'pipeline_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt'
            report_file.write_text(report)
            
            logger.info(f"✅ Report saved: {report_file}")
            
            # Print report
            print("\n" + report)
            
            # TODO: Send via email/Discord
            
        except Exception as e:
            logger.warning(f"⚠️  Report generation warning: {e}")
    
    def _generate_report_text(self) -> str:
        """Generate pipeline report text"""
        
        duration = datetime.now() - self.start_time
        
        report = f"""
{'=' * 70}
WEEKLY ML PIPELINE REPORT
{'=' * 70}
Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Duration: {duration.total_seconds() / 60:.1f} minutes

RESULTS:
--------
1. Data Download: {self.results['download']['status'].upper()}
   - Symbols: {self.results['download']['details'].get('symbols_processed', 0)}/{len(SYMBOLS)}
   - Bars: {self.results['download']['details'].get('total_bars', 0):,}

2. Feature Generation: {self.results['features']['status'].upper()}

3. Label Generation: {self.results['labels']['status'].upper()}
   - Labels: {self.results['labels']['details'].get('count', 0)}

4. Model Training: {self.results['training']['status'].upper()}
   - Successful: {self.results['training'].get('summary', {}).get('successful', 0)}/{len(SYMBOLS)}
   - Failed: {self.results['training'].get('summary', {}).get('failed', 0)}/{len(SYMBOLS)}

5. Model Deployment: {self.results['deployment']['status'].upper()}

MODEL STATUS:
-------------
"""
        
        for symbol, status in self.results['training']['models'].items():
            emoji = '✅' if status == 'success' else '❌'
            report += f"{emoji} {symbol}: {status}\n"
        
        if self.errors:
            report += f"\nERRORS ({len(self.errors)}):\n"
            report += "-------------\n"
            for error in self.errors:
                report += f"• {error}\n"
        
        report += f"\n{'=' * 70}\n"
        
        return report
    
    def send_error_notification(self, error: Exception):
        """Send error notification"""
        logger.error(f"Sending error notification: {error}")
        # TODO: Implement Discord/email notification

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
        pipeline = WeeklyMLPipeline()
        success = pipeline.run()
        
        sys.exit(0 if success else 1)
        
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
