#!/bin/bash

# Cleanup script to keep only production-ready files
# Keeps: 4 best models, 3 training scripts, 2 docs, data files

echo "🧹 Cleaning up for production..."
echo "Keeping only best performing models and essential files"
echo ""

# Navigate to ml_training directory
cd ml_training

# Delete intermediate training scripts
echo "Deleting intermediate training scripts..."
rm -f phase3_final_push.py
rm -f phase4a_horizon_optimization.py
rm -f enhanced_training.py
rm -f optimize_all_models.py
rm -f fix_recall_issue.py
rm -f fix_all_tickers.py
rm -f train_from_parquet.py
rm -f realistic_backtest.py
rm -f fixed_backtest.py

# Delete validation scripts
echo "Deleting validation scripts..."
rm -f validation_framework.py
rm -f comprehensive_validation.py
rm -f simple_validation.py
rm -f calculate_sharpe_ratios.py
rm -f validate_and_clean_data.py
rm -f test_all_symbols.py

# Delete analysis scripts
echo "Deleting analysis scripts..."
rm -f regime_analyzer.py
rm -f stress_tester.py
rm -f trade_statistics_analyzer.py

# Delete intermediate models (keep only best)
echo "Deleting intermediate models..."
cd models
rm -f ES_PHASE1_FIXED.joblib
rm -f ES_PHASE4B_ULTIMATE.joblib
rm -f NQ_PHASE1_FIXED.joblib
rm -f NQ_PHASE3_FINAL.joblib
rm -f NQ_PHASE4A_FINAL.joblib
rm -f NQ_PHASE4B_ULTIMATE.joblib
rm -f YM_PHASE1_FIXED.joblib
rm -f YM_PHASE2_FINAL.joblib
rm -f YM_PHASE3_FINAL.joblib
rm -f YM_PHASE4A_FINAL.joblib
rm -f RTY_PHASE1_FIXED.joblib
rm -f RTY_PHASE2_FINAL.joblib

echo "✅ Kept best models:"
ls -lh *.joblib
cd ..

# Delete intermediate documentation
echo ""
echo "Deleting intermediate documentation..."
rm -f VALIDATION_PHASE1_START.md
rm -f PHASE1_VALIDATION_REPORT.md
rm -f OPTIMIZATION_ANALYSIS.md
rm -f VALIDATION_ISSUE_ANALYSIS.md
rm -f FINAL_FIX_SUMMARY.md

cd ..

# Delete root-level intermediate docs
rm -f COMPREHENSIVE_PROJECT_SUMMARY.md
rm -f COMPLETE_FINAL_RESULTS.md
rm -f FINAL_PROJECT_STATUS.md
rm -f VALIDATION_CHECKLIST.md
rm -f VALIDATION_SUMMARY.md

# Delete phase result files
rm -f ml_training/phase*_results.txt

echo ""
echo "✅ Production cleanup complete!"
echo ""
echo "📁 Remaining structure:"
echo "ml_training/"
echo "  ├── models/"
echo "  │   ├── ES_PHASE2_FINAL.joblib (7.0% edge)"
echo "  │   ├── RTY_PHASE4B_ULTIMATE.joblib (5.8% edge)"
echo "  │   ├── YM_PHASE4B_ULTIMATE.joblib (5.2% edge)"
echo "  │   └── NQ_PHASE2_FINAL.joblib (4.4% edge)"
echo "  ├── phase1_fixed_training.py"
echo "  ├── phase2_advanced_fixes.py"
echo "  └── phase4b_ultimate_optimization.py"
echo ""
echo "📄 Documentation:"
echo "  ├── ULTIMATE_FINAL_RESULTS.md"
echo "  └── PRODUCTION_READY_SUMMARY.md"
echo ""
echo "🚀 Ready for production!"
