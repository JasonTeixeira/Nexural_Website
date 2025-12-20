#!/bin/bash

# Complete Pipeline Testing Script
# Run this after pausing/resuming Supabase

echo "🧪 Nexural Trading - Complete Pipeline Tests"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to run test
run_test() {
  TEST_NAME=$1
  COMMAND=$2
  EXPECTED=$3
  
  echo "${CYAN}Testing: $TEST_NAME${NC}"
  RESULT=$(eval $COMMAND 2>&1)
  
  if echo "$RESULT" | grep -q "$EXPECTED"; then
    echo "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
  else
    echo "${RED}✗ FAILED${NC}"
    echo "Expected: $EXPECTED"
    echo "Got: $RESULT"
    ((FAILED++))
  fi
  echo ""
}

# Check if server is running
if ! curl -s http://localhost:3036 > /dev/null; then
  echo "${RED}Error: Dev server not running!${NC}"
  echo "Start it with: npm run dev"
  exit 1
fi

echo "${YELLOW}Phase 1: API Endpoint Tests${NC}"
echo "----------------------------"
echo ""

# Test 1: FREE Discord Signup
run_test "FREE Discord Signup" \
  "curl -s -X POST http://localhost:3036/api/discord/free-signup -H 'Content-Type: application/json' -d '{\"email\":\"test1@example.com\",\"name\":\"Test 1\",\"acceptedTerms\":true,\"acceptedPrivacy\":true}'" \
  "success"

# Test 2: Waitlist Signup
run_test "Waitlist Signup" \
  "curl -s -X POST http://localhost:3036/api/waitlist -H 'Content-Type: application/json' -d '{\"email\":\"test2@example.com\",\"fullName\":\"Test 2\",\"planName\":\"OrderFlow Pro\"}'" \
  "success"

# Test 3: Duplicate Detection
run_test "Duplicate Email Detection" \
  "curl -s -X POST http://localhost:3036/api/discord/free-signup -H 'Content-Type: application/json' -d '{\"email\":\"test1@example.com\",\"name\":\"Test 1\",\"acceptedTerms\":true,\"acceptedPrivacy\":true}'" \
  "already registered"

# Test 4: Invalid Email
run_test "Invalid Email Format" \
  "curl -s -X POST http://localhost:3036/api/discord/free-signup -H 'Content-Type: application/json' -d '{\"email\":\"notanemail\",\"name\":\"Test\",\"acceptedTerms\":true,\"acceptedPrivacy\":true}'" \
  "Invalid email"

# Test 5: Missing Terms
run_test "Missing Terms Acceptance" \
  "curl -s -X POST http://localhost:3036/api/discord/free-signup -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"name\":\"Test\",\"acceptedTerms\":false,\"acceptedPrivacy\":true}'" \
  "required"

# Test 6: Position Auto-Increment
echo "${CYAN}Testing: Waitlist Position Auto-Increment${NC}"
POS1=$(curl -s -X POST http://localhost:3036/api/waitlist -H 'Content-Type: application/json' -d '{"email":"pos1@example.com","fullName":"User 1","planName":"OrderFlow Pro"}' | grep -o '"position":[0-9]*' | cut -d: -f2)
POS2=$(curl -s -X POST http://localhost:3036/api/waitlist -H 'Content-Type: application/json' -d '{"email":"pos2@example.com","fullName":"User 2","planName":"OrderFlow Pro"}' | grep -o '"position":[0-9]*' | cut -d: -f2)
POS3=$(curl -s -X POST http://localhost:3036/api/waitlist -H 'Content-Type: application/json' -d '{"email":"pos3@example.com","fullName":"User 3","planName":"OrderFlow Pro"}' | grep -o '"position":[0-9]*' | cut -d: -f2)

if [ $((POS2 - POS1)) -eq 1 ] && [ $((POS3 - POS2)) -eq 1 ]; then
  echo "${GREEN}✓ PASSED${NC}"
  echo "Positions: $POS1 → $POS2 → $POS3 (correctly incremented)"
  ((PASSED++))
else
  echo "${RED}✗ FAILED${NC}"
  echo "Positions: $POS1 → $POS2 → $POS3 (not sequential)"
  ((FAILED++))
fi
echo ""

echo ""
echo "${YELLOW}Phase 2: Manual Checks Required${NC}"
echo "--------------------------------"
echo ""
echo "${CYAN}Please verify the following:${NC}"
echo ""
echo "1. Check Resend Dashboard:"
echo "   https://resend.com/emails"
echo "   → Should see 'Welcome to Nexural Trading' emails"
echo "   → Should see 'Discord Invite' emails"
echo "   → Should see 'Waitlist' emails"
echo ""
echo "2. Check Supabase Database:"
echo "   https://app.supabase.com"
echo "   → Table Editor → members (should have test1@example.com)"
echo "   → Table Editor → waitlist (should have test2@example.com, pos1-3)"
echo ""
echo "3. Test with YOUR email:"
echo "   curl -X POST http://localhost:3036/api/discord/free-signup \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"YOUR_EMAIL@example.com\",\"name\":\"Your Name\",\"acceptedTerms\":true,\"acceptedPrivacy\":true}'"
echo ""
echo "   → Check your inbox for emails"
echo "   → Click Discord link and verify it works"
echo ""

echo ""
echo "=============================================="
echo "${GREEN}✓ Passed: $PASSED${NC}"
echo "${RED}✗ Failed: $FAILED${NC}"
echo "=============================================="
echo ""

if [ $FAILED -eq 0 ]; then
  echo "${GREEN}🎉 All automated tests passed!${NC}"
  echo ""
  echo "${YELLOW}Next steps:${NC}"
  echo "1. Complete the manual checks above"
  echo "2. Test with your real email"
  echo "3. Verify emails arrive and look good"
  echo "4. Test Discord link works"
  echo "5. Check database records"
  echo ""
  echo "${GREEN}If everything looks good, you're ready for production!${NC}"
else
  echo "${RED}❌ Some tests failed. Check the errors above.${NC}"
  echo ""
  echo "Common fixes:"
  echo "- Make sure you paused/resumed Supabase"
  echo "- Check .env.local has all required variables"
  echo "- Verify tables exist in Supabase"
  echo "- Check server logs for detailed errors"
fi
