#!/bin/bash

# Full ML Trading System Pipeline Execution
# This script executes all phases sequentially with verification at each step

set -e  # Exit on error

echo "========================================================================"
echo "🚀 ML TRADING SYSTEM - FULL PIPELINE EXECUTION"
echo "========================================================================"
echo ""
echo "This will execute all 8 phases:"
echo "  Phase 0: ✅ Verification (Complete)"
echo "  Phase 1: Data Processing (1-2 hours)"
echo "  Phase 2: Feature Engineering (30-45 min)"
echo "  Phase 3: ML Model Training (2-3 hours)"
echo "  Phase 4: Backtesting (1-2 hours)"
echo "  Phase 5: API Testing (30 min)"
echo "  Phase 6: Paper Trading Setup (15 min)"
echo "  Phase 7: Dashboard Integration (manual)"
echo "  Phase 8: End-to-End Testing (manual)"
echo ""
echo "Total estimated time: 6-9 hours"
echo "========================================================================"
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ Error: .env.local not found"
    exit 1
fi

# Function to check if table exists
check_table() {
    local table_name=$1
    echo "Checking if table '$table_name' exists..."
    
    # This will be implemented via Node.js script
    node -e "
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    (async () => {
        const { data, error } = await supabase.from('$table_name').select('id', { count: 'exact', head: true });
        if (error && error.code === '42P01') {
            console.log('TABLE_NOT_EXISTS');
            process.exit(1);
        } else {
            console.log('TABLE_EXISTS');
            process.exit(0);
        }
    })();
    "
}

# Phase 1: Data Processing
echo ""
echo "========================================================================"
echo "📊 PHASE 1: DATA PROCESSING"
echo "========================================================================"
echo ""

# Check if multi_timeframe_data table exists
echo "Step 1.1: Checking multi_timeframe_data table..."
if check_table "multi_timeframe_data" 2>/dev/null; then
    echo "✅ Table exists"
else
    echo "⚠️  Table does not exist - needs to be created in Supabase SQL Editor"
    echo ""
    echo "ACTION REQUIRED:"
    echo "1. Go to Supabase Dashboard → SQL Editor"
    echo "2. Copy contents from: supabase/migrations/20251003_create_multi_timeframe_data.sql"
    echo "3. Execute the SQL"
    echo "4. Re-run this script"
    echo ""
    exit 1
fi

echo ""
echo "Step 1.2: Running Phase 1A - Multi-Timeframe Aggregation..."
echo "This will process 25 DBN files and create multi-timeframe bars"
echo "Estimated time: 30-60 minutes"
echo ""
read -p "Press Enter to start Phase 1A..."

python3 scripts/phase1-multi-timeframe-aggregation.py

if [ $? -eq 0 ]; then
    echo "✅ Phase 1A Complete"
else
    echo "❌ Phase 1A Failed"
    exit 1
fi

# Phase 2: Feature Engineering
echo ""
echo "========================================================================"
echo "🔧 PHASE 2: FEATURE ENGINEERING"
echo "========================================================================"
echo ""

echo "Step 2.1: Running Phase 1B - Advanced Feature Engineering..."
echo "This will add 50+ technical indicators"
echo "Estimated time: 20-30 minutes"
echo ""
read -p "Press Enter to start Phase 1B..."

python3 scripts/phase1b-advanced-feature-engineering.py

if [ $? -eq 0 ]; then
    echo "✅ Phase 1B Complete"
else
    echo "❌ Phase 1B Failed"
    exit 1
fi

echo ""
echo "Step 2.2: Running Phase 2 - Regime Detection..."
echo "This will classify market regimes"
echo "Estimated time: 15-20 minutes"
echo ""
read -p "Press Enter to start Phase 2..."

python3 scripts/phase2-regime-detection.py

if [ $? -eq 0 ]; then
    echo "✅ Phase 2 Complete"
else
    echo "❌ Phase 2 Failed"
    exit 1
fi

# Phase 3: ML Model Training
echo ""
echo "========================================================================"
echo "🤖 PHASE 3: ML MODEL TRAINING"
echo "========================================================================"
echo ""

echo "Step 3.1: Training ML Ensemble Models..."
echo "This will train 6 models per symbol × 21 symbols = 126 models"
echo "Estimated time: 2-3 hours"
echo ""
read -p "Press Enter to start Phase 3..."

python3 scripts/phase3-ml-model-training.py

if [ $? -eq 0 ]; then
    echo "✅ Phase 3 Complete"
else
    echo "❌ Phase 3 Failed"
    exit 1
fi

# Phase 4: Backtesting
echo ""
echo "========================================================================"
echo "📈 PHASE 4: BACKTESTING"
echo "========================================================================"
echo ""

echo "Step 4.1: Running Comprehensive Backtests..."
echo "This will backtest all strategies with walk-forward validation"
echo "Estimated time: 1-2 hours"
echo ""
read -p "Press Enter to start Phase 4..."

python3 scripts/phase5-backtesting-engine.py

if [ $? -eq 0 ]; then
    echo "✅ Phase 4 Complete"
else
    echo "❌ Phase 4 Failed"
    exit 1
fi

# Phase 5: API Testing
echo ""
echo "========================================================================"
echo "🔌 PHASE 5: API & INTEGRATION TESTING"
echo "========================================================================"
echo ""

echo "Step 5.1: Testing API Endpoints..."
echo "Estimated time: 5-10 minutes"
echo ""
read -p "Press Enter to start Phase 5..."

# Start dev server in background
npm run dev &
DEV_SERVER_PID=$!
sleep 10  # Wait for server to start

# Test endpoints
node scripts/test-api-endpoints.js

if [ $? -eq 0 ]; then
    echo "✅ Phase 5 Complete"
else
    echo "❌ Phase 5 Failed"
    kill $DEV_SERVER_PID
    exit 1
fi

# Kill dev server
kill $DEV_SERVER_PID

# Phase 6: Paper Trading Setup
echo ""
echo "========================================================================"
echo "📝 PHASE 6: PAPER TRADING SETUP"
echo "========================================================================"
echo ""

echo "Step 6.1: Testing Signal Generation..."
echo "Estimated time: 5 minutes"
echo ""

python3 scripts/test-ml-signals.py

if [ $? -eq 0 ]; then
    echo "✅ Phase 6 Complete"
else
    echo "❌ Phase 6 Failed"
    exit 1
fi

# Summary
echo ""
echo "========================================================================"
echo "🎉 PIPELINE EXECUTION COMPLETE!"
echo "========================================================================"
echo ""
echo "✅ Phase 1: Data Processing - Complete"
echo "✅ Phase 2: Feature Engineering - Complete"
echo "✅ Phase 3: ML Model Training - Complete"
echo "✅ Phase 4: Backtesting - Complete"
echo "✅ Phase 5: API Testing - Complete"
echo "✅ Phase 6: Paper Trading Setup - Complete"
echo ""
echo "📋 NEXT STEPS (Manual):"
echo ""
echo "Phase 7: Admin Dashboard Integration"
echo "  - Build dashboard pages in app/admin/"
echo "  - Test data visualization"
echo "  - Verify real-time updates"
echo ""
echo "Phase 8: End-to-End Testing"
echo "  - Run complete system test"
echo "  - Validate all workflows"
echo "  - Start paper trading"
echo ""
echo "========================================================================"
echo ""
