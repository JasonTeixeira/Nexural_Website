#!/bin/bash

# Professional QA Sprint Execution Script
# This script runs all 138+ tests in optimal order with comprehensive reporting

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create results directory
RESULTS_DIR="qa-results-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PROFESSIONAL QA SPRINT - DAY 1${NC}"
echo -e "${BLUE}  Starting Comprehensive Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to log results
log_result() {
    echo "$1" | tee -a "$RESULTS_DIR/test-summary.log"
}

# Function to run tests and capture results
run_test_suite() {
    local test_name=$1
    local test_command=$2
    local test_file=$3
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    echo "Command: $test_command"
    echo "Started at: $(date)"
    
    if eval "$test_command" > "$RESULTS_DIR/$test_file" 2>&1; then
        echo -e "${GREEN}✓ $test_name PASSED${NC}"
        log_result "✓ $test_name - PASSED"
        return 0
    else
        echo -e "${RED}✗ $test_name FAILED${NC}"
        log_result "✗ $test_name - FAILED (see $test_file)"
        return 1
    fi
}

# Initialize counters
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 1: Dependency Verification${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
    log_result "✓ Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    log_result "✗ Node.js not found"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: $NPM_VERSION${NC}"
    log_result "✓ npm: $NPM_VERSION"
else
    echo -e "${RED}✗ npm not found${NC}"
    log_result "✗ npm not found"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 2: Component Tests (Fast)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "Component Tests" "npm test -- tests/components --passWithNoTests" "component-tests.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 3: Backend Unit Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "Backend Tests" "npm test -- tests/backend --passWithNoTests" "backend-tests.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 4: Integration Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "Integration Tests" "npm test -- tests/integration --passWithNoTests" "integration-tests.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 5: Security Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "Security Tests" "npm test -- tests/security --passWithNoTests" "security-tests.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PHASE 6: Pipeline Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

TOTAL_SUITES=$((TOTAL_SUITES + 1))
if run_test_suite "Pipeline Tests" "npm test -- tests/pipelines --passWithNoTests" "pipeline-tests.log"; then
    PASSED_SUITES=$((PASSED_SUITES + 1))
else
    FAILED_SUITES=$((FAILED_SUITES + 1))
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}FINAL SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Calculate pass rate
PASS_RATE=0
if [ $TOTAL_SUITES -gt 0 ]; then
    PASS_RATE=$((PASSED_SUITES * 100 / TOTAL_SUITES))
fi

echo "Test Execution Complete!"
echo "Results saved to: $RESULTS_DIR"
echo ""
echo "Summary:"
echo "  Total Test Suites: $TOTAL_SUITES"
echo "  Passed: $PASSED_SUITES"
echo "  Failed: $FAILED_SUITES"
echo "  Pass Rate: $PASS_RATE%"
echo ""

# Generate summary report
cat > "$RESULTS_DIR/SUMMARY.md" << EOF
# QA Sprint Test Execution Summary

**Execution Date:** $(date)
**Results Directory:** $RESULTS_DIR

## Overall Results

- **Total Test Suites:** $TOTAL_SUITES
- **Passed:** $PASSED_SUITES
- **Failed:** $FAILED_SUITES
- **Pass Rate:** $PASS_RATE%

## Test Suite Breakdown

### Phase 1: Dependency Verification
- Node.js: $NODE_VERSION
- npm: $NPM_VERSION

### Phase 2: Component Tests
- Status: See component-tests.log

### Phase 3: Backend Unit Tests
- Status: See backend-tests.log

### Phase 4: Integration Tests
- Status: See integration-tests.log

### Phase 5: Security Tests
- Status: See security-tests.log

### Phase 6: Pipeline Tests
- Status: See pipeline-tests.log

## Next Steps

1. Review failed test logs in $RESULTS_DIR
2. Categorize bugs by severity
3. Create bug tickets for failures
4. Run E2E tests (Day 2)
5. Run performance tests (Day 3)

## Detailed Logs

All test output has been saved to individual log files in this directory.
EOF

echo -e "${GREEN}Summary report generated: $RESULTS_DIR/SUMMARY.md${NC}"
echo ""

if [ $FAILED_SUITES -gt 0 ]; then
    echo -e "${RED}⚠ Some tests failed. Review logs in $RESULTS_DIR${NC}"
    exit 1
else
    echo -e "${GREEN}✓ All test suites passed!${NC}"
    exit 0
fi
