#!/bin/bash

# Blog System Test Runner
# Runs all blog-related tests

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║         🧪 BLOG SYSTEM TEST SUITE 🧪                    ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
INTEGRATION_PASSED=0
E2E_PASSED=0

echo "📋 Test Plan:"
echo "  1. Integration Tests (Database & API)"
echo "  2. E2E Tests (User Interface & Interactions)"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Check if dev server is running for E2E tests
echo "${BLUE}🔍 Checking prerequisites...${NC}"
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "${YELLOW}⚠️  Warning: Dev server not running on localhost:3000${NC}"
    echo "${YELLOW}   E2E tests may fail. Start with: npm run dev${NC}"
    echo ""
fi

# Check environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] && [ ! -f .env.local ]; then
    echo "${RED}❌ Error: .env.local not found${NC}"
    echo "${RED}   Please create .env.local with Supabase credentials${NC}"
    exit 1
fi

echo "${GREEN}✅ Prerequisites check passed${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Run Integration Tests
echo "${BLUE}📊 Running Integration Tests...${NC}"
echo "   Testing: Database operations, CRUD, queries"
echo ""

if npm test tests/integration/blog-system.test.js 2>&1 | tee /tmp/blog-integration-test.log; then
    INTEGRATION_PASSED=1
    echo ""
    echo "${GREEN}✅ Integration Tests PASSED${NC}"
else
    echo ""
    echo "${RED}❌ Integration Tests FAILED${NC}"
    echo "${YELLOW}   Check logs above for details${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Run E2E Tests
echo "${BLUE}🌐 Running E2E Tests...${NC}"
echo "   Testing: Pages, navigation, user interactions"
echo ""

if npx playwright test tests/e2e/blog-pages.spec.ts 2>&1 | tee /tmp/blog-e2e-test.log; then
    E2E_PASSED=1
    echo ""
    echo "${GREEN}✅ E2E Tests PASSED${NC}"
else
    echo ""
    echo "${RED}❌ E2E Tests FAILED${NC}"
    echo "${YELLOW}   Check logs above for details${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Summary
echo "📊 TEST SUMMARY"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ $INTEGRATION_PASSED -eq 1 ]; then
    echo "${GREEN}✅ Integration Tests: PASSED${NC}"
else
    echo "${RED}❌ Integration Tests: FAILED${NC}"
fi

if [ $E2E_PASSED -eq 1 ]; then
    echo "${GREEN}✅ E2E Tests: PASSED${NC}"
else
    echo "${RED}❌ E2E Tests: FAILED${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Final result
if [ $INTEGRATION_PASSED -eq 1 ] && [ $E2E_PASSED -eq 1 ]; then
    echo "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo "${GREEN}║                                                          ║${NC}"
    echo "${GREEN}║              🎉 ALL TESTS PASSED! 🎉                     ║${NC}"
    echo "${GREEN}║                                                          ║${NC}"
    echo "${GREEN}║         Blog system is working perfectly!               ║${NC}"
    echo "${GREEN}║                                                          ║${NC}"
    echo "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 0
else
    echo "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo "${RED}║                                                          ║${NC}"
    echo "${RED}║              ⚠️  SOME TESTS FAILED ⚠️                    ║${NC}"
    echo "${RED}║                                                          ║${NC}"
    echo "${RED}║         Please review the errors above               ║${NC}"
    echo "${RED}║                                                          ║${NC}"
    echo "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "💡 Troubleshooting tips:"
    echo "   1. Check database connection: node scripts/test-database-connection.js"
    echo "   2. Ensure dev server is running: npm run dev"
    echo "   3. Add sample data: node scripts/add-sample-blog-post.js"
    echo "   4. Review logs in /tmp/blog-*-test.log"
    echo ""
    exit 1
fi
