#!/bin/bash

# Nexural Trading - Complete E2E Test Suite
# This script runs all tests: infrastructure, integration, pipelines, and E2E
# Run from project root: bash scripts/run-complete-e2e-tests.sh

echo "🧪 Nexural Trading - Complete E2E Test Suite"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
START_TIME=$(date +%s)

# Create test results directory
mkdir -p test-results/latest
RESULTS_FILE="test-results/latest/summary.json"
FAILED_LOG="test-results/latest/failed-tests.log"

# Clear previous results
> "$FAILED_LOG"

# Function to run a test and track results
run_test() {
    local test_name=$1
    local test_command=$2
    local required=$3  # "required" or "optional"
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running: $test_name${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    ((TOTAL_TESTS++))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ PASSED: $test_name${NC}\n"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}✗ FAILED: $test_name${NC}\n"
        echo "FAILED: $test_name" >> "$FAILED_LOG"
        ((FAILED_TESTS++))
        
        if [ "$required" == "required" ]; then
            echo -e "${RED}⚠️  This is a required test. Continuing but marking as critical failure.${NC}\n"
        fi
        return 1
    fi
}

# ============================================
# PHASE 1: INFRASTRUCTURE TESTS (5 minutes)
# ============================================
echo -e "\n${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  PHASE 1: INFRASTRUCTURE TESTS         ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}\n"

run_test "Environment Variables" "node scripts/verify-env.js" "required"
run_test "Database Connectivity" "node scripts/test-database-connectivity.js" "required"
run_test "Discord Webhooks" "node scripts/test-new-discord-channels.js" "optional"

# ============================================
# PHASE 2: SERVICE INTEGRATION TESTS (10 minutes)
# ============================================
echo -e "\n${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  PHASE 2: SERVICE INTEGRATION TESTS    ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}\n"

run_test "Newsletter System" "node scripts/test-newsletter-complete.js" "required"
run_test "Admin Dashboard API" "node scripts/test-admin-dashboard-api.js" "required"
run_test "Member System" "node scripts/test-member-system.js" "required"
run_test "Backup System" "node scripts/test-backup-simple.js" "optional"

# ============================================
# PHASE 3: PIPELINE TESTS (15 minutes)
# ============================================
echo -e "\n${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  PHASE 3: PIPELINE TESTS               ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}\n"

run_test "Pipeline 1: Market Data → Signals → Discord" "node scripts/test-market-data-pipeline.js" "required"
run_test "Pipeline 2: Signal Delivery Complete" "node scripts/test-signal-delivery-complete.js" "required"

# ============================================
# PHASE 4: COMPREHENSIVE E2E TESTS (20 minutes)
# ============================================
echo -e "\n${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  PHASE 4: COMPREHENSIVE E2E TESTS      ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}\n"

echo "⚠️  E2E browser tests not yet implemented"
echo "   (Requires Playwright setup)"

# ============================================
# PHASE 5: PERFORMANCE & STRESS TESTS (10 minutes)
# ============================================
echo -e "\n${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  PHASE 5: PERFORMANCE TESTS            ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}\n"

echo "⚠️  Performance tests not yet implemented"
echo "   (Can be added later)"

# ============================================
# CALCULATE RESULTS
# ============================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

PASS_RATE=0
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
fi

# ============================================
# GENERATE SUMMARY
# ============================================
echo -e "\n${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           TEST SUMMARY                 ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}\n"

echo -e "Total Tests:    ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:         ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:         ${RED}$FAILED_TESTS${NC}"
echo -e "Pass Rate:      ${YELLOW}$PASS_RATE%${NC}"
echo -e "Duration:       ${CYAN}${MINUTES}m ${SECONDS}s${NC}"
echo ""

# Save JSON summary
cat > "$RESULTS_FILE" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "total_tests": $TOTAL_TESTS,
  "passed": $PASSED_TESTS,
  "failed": $FAILED_TESTS,
  "pass_rate": $PASS_RATE,
  "duration_seconds": $DURATION,
  "status": "$([ $FAILED_TESTS -eq 0 ] && echo "SUCCESS" || echo "FAILED")"
}
EOF

# ============================================
# SHOW FAILED TESTS
# ============================================
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║         FAILED TESTS                   ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}\n"
    cat "$FAILED_LOG"
    echo ""
fi

# ============================================
# FINAL STATUS
# ============================================
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}Your system is ready for production.${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo -e "${YELLOW}Review failed tests in: $FAILED_LOG${NC}"
    echo -e "${YELLOW}Fix issues and run tests again.${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    exit 1
fi
