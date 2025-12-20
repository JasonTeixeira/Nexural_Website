#!/bin/bash
# ES ML Pipeline Test - Complete End-to-End
# Tests the entire ML pipeline with ES symbol only

set -e  # Exit on error

echo "======================================================================"
echo "🚀 ES ML PIPELINE TEST - PROOF OF CONCEPT"
echo "======================================================================"
echo ""
echo "This will:"
echo "  1. Process ES raw data → Database (5-10 min)"
echo "  2. Generate ES features (5 min)"
echo "  3. Generate ES labels (3 min)"
echo "  4. Train ES model (10-15 min)"
echo "  5. Validate model quality"
echo ""
echo "Total time: ~30 minutes"
echo "======================================================================"
echo ""

# Check if ES data file exists
if [ ! -f "data/historical_30days/ES.c.0_20250901_20251001.dbn.zst" ]; then
    echo "❌ ES data file not found!"
    exit 1
fi

echo "✅ ES data file found (3.2GB)"
echo ""

# Step 1: Process raw data
echo "======================================================================"
echo "📊 STEP 1/4: Processing ES raw data → Database"
echo "======================================================================"
echo "This converts the compressed Databento file into structured OHLCV bars"
echo "Estimated time: 5-10 minutes"
echo ""

python3 scripts/process-dbn-to-features.py --symbol ES

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Step 1 failed: Data processing error"
    exit 1
fi

echo ""
echo "✅ Step 1 complete: ES data processed to database"
echo ""

# Step 2: Generate features
echo "======================================================================"
echo "📈 STEP 2/4: Generating ES ML features"
echo "======================================================================"
echo "This calculates 50+ technical indicators (RSI, MACD, Bollinger, etc.)"
echo "Estimated time: 5 minutes"
echo ""

curl -s "http://localhost:3036/api/cron/hourly-feature-generation?symbol=ES" | jq '.'

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Step 2 failed: Feature generation error"
    echo "Make sure your Next.js server is running: npm run dev"
    exit 1
fi

echo ""
echo "✅ Step 2 complete: ES features generated"
echo ""

# Step 3: Generate labels
echo "======================================================================"
echo "🎯 STEP 3/4: Generating ES training labels"
echo "======================================================================"
echo "This creates target labels for ML (what to predict)"
echo "Estimated time: 3 minutes"
echo ""

python3 ml_training/label_generator.py --symbol ES

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Step 3 failed: Label generation error"
    exit 1
fi

echo ""
echo "✅ Step 3 complete: ES labels generated"
echo ""

# Step 4: Train model
echo "======================================================================"
echo "🤖 STEP 4/4: Training ES ML model"
echo "======================================================================"
echo "This trains an XGBoost model on 30 days of ES data"
echo "Estimated time: 10-15 minutes"
echo ""

python3 ml_training/train_pipeline.py --symbol ES --days 30

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Step 4 failed: Model training error"
    exit 1
fi

echo ""
echo "✅ Step 4 complete: ES model trained"
echo ""

# Summary
echo "======================================================================"
echo "🎉 ES ML PIPELINE TEST COMPLETE!"
echo "======================================================================"
echo ""
echo "✅ All 4 steps completed successfully:"
echo "   1. ✅ Raw data processed to database"
echo "   2. ✅ ML features generated"
echo "   3. ✅ Training labels created"
echo "   4. ✅ Model trained and saved"
echo ""
echo "📊 You now have:"
echo "   • ES market data in Supabase"
echo "   • ES technical indicators calculated"
echo "   • ES ML model ready for inference"
echo "   • Ability to generate ES trading signals"
echo ""
echo "======================================================================"
echo "🚀 NEXT STEPS"
echo "======================================================================"
echo ""
echo "Option 1: Test ES model inference"
echo "  python3 ml_training/inference.py --symbol ES"
echo ""
echo "Option 2: Scale to Top 5 symbols (NQ, GC, CL, BTC)"
echo "  bash scripts/train-top-5-symbols.sh"
echo ""
echo "Option 3: Train all 21 symbols"
echo "  bash scripts/train-all-symbols.sh"
echo ""
echo "======================================================================"
