#!/bin/bash
# ES ML Pipeline - Complete Automated Solution
# Automatically loads environment variables and runs entire pipeline

set -e  # Exit on error

echo "======================================================================"
echo "🚀 ES ML PIPELINE - FULLY AUTOMATED"
echo "======================================================================"
echo ""
echo "This script will:"
echo "  1. Load environment variables from .env.local"
echo "  2. Process ES raw data → Database (5-10 min)"
echo "  3. Generate ES features (5 min)"
echo "  4. Generate ES labels (3 min)"
echo "  5. Train ES model (10-15 min)"
echo ""
echo "Total time: ~30 minutes"
echo "======================================================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please make sure you're in the project root directory."
    exit 1
fi

# Load environment variables from .env.local
echo "📋 Loading environment variables from .env.local..."

# Export SUPABASE_URL as NEXT_PUBLIC_SUPABASE_URL (what Python needs)
export NEXT_PUBLIC_SUPABASE_URL=$(grep "^SUPABASE_URL=" .env.local | cut -d '=' -f2)
export SUPABASE_SERVICE_ROLE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d '=' -f2)

# Verify variables are loaded
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Failed to load Supabase credentials from .env.local"
    echo ""
    echo "Please check that .env.local contains:"
    echo "  SUPABASE_URL=..."
    echo "  SUPABASE_SERVICE_ROLE_KEY=..."
    exit 1
fi

echo "✅ Environment variables loaded successfully"
echo "   NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
echo "   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:30}..."
echo ""

# Check if ES data file exists
if [ ! -f "data/historical_30days/ES.c.0_20250901_20251001.dbn.zst" ]; then
    echo "❌ ES data file not found!"
    echo "Expected: data/historical_30days/ES.c.0_20250901_20251001.dbn.zst"
    exit 1
fi

echo "✅ ES data file found (3.2GB)"
echo ""

# Step 1: Process raw data
echo "======================================================================"
echo "📊 STEP 1/4: Processing ES raw data → Database"
echo "======================================================================"
echo "Converting 3.2GB compressed file into structured OHLCV bars..."
echo "Estimated time: 5-10 minutes"
echo ""

python3 scripts/process-dbn-to-features.py --symbol ES

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Step 1 failed: Data processing error"
    echo ""
    echo "Common issues:"
    echo "  1. Supabase connection failed - check credentials"
    echo "  2. Python packages missing - run: pip3 install databento supabase pandas"
    echo "  3. Data file corrupted - re-download if needed"
    exit 1
fi

echo ""
echo "✅ Step 1 complete: ES data processed to database"
echo ""

# Step 2: Generate features
echo "======================================================================"
echo "📈 STEP 2/4: Generating ES ML features"
echo "======================================================================"
echo "Calculating 50+ technical indicators (RSI, MACD, Bollinger, etc.)..."
echo "Estimated time: 5 minutes"
echo ""

# Check if Next.js server is running
if ! curl -s http://localhost:3036/api/health > /dev/null 2>&1; then
    echo "⚠️  Warning: Next.js server not detected on port 3036"
    echo "Trying port 3000..."
    
    if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo ""
        echo "❌ Next.js server is not running!"
        echo ""
        echo "Please start the server in another terminal:"
        echo "  npm run dev"
        echo ""
        echo "Then re-run this script."
        exit 1
    else
        SERVER_PORT=3000
    fi
else
    SERVER_PORT=3036
fi

echo "✅ Next.js server detected on port $SERVER_PORT"
echo ""

curl -s "http://localhost:$SERVER_PORT/api/cron/hourly-feature-generation?symbol=ES"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Step 2 failed: Feature generation error"
    echo ""
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
echo "Creating target labels for ML (what to predict)..."
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
echo "Training XGBoost model on 30 days of ES data..."
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
echo "🎉 ES ML PIPELINE COMPLETE!"
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
echo ""
echo "🎉 Congratulations! Your ES ML model is ready to generate signals!"
echo ""
