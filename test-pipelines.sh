#!/bin/bash

# Test Email & Discord Pipelines
# Make sure dev server is running: npm run dev

echo "🧪 Testing Email & Discord Pipelines..."
echo ""

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: FREE Discord Signup
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${CYAN}Test 1: FREE Discord Signup${NC}"
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${YELLOW}Testing: POST /api/discord/free-signup${NC}"
echo ""

curl -X POST http://localhost:3036/api/discord/free-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "acceptedTerms": true,
    "acceptedPrivacy": true
  }' \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "${GREEN}✓ Check your inbox (test@example.com) for:${NC}"
echo "  1. Welcome email (within 10 seconds)"
echo "  2. Discord invite email (within 40 seconds)"
echo ""
echo "Press Enter when ready to continue..."
read

# Test 2: OrderFlow Pro Waitlist
echo ""
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${CYAN}Test 2: OrderFlow Pro Waitlist${NC}"
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${YELLOW}Testing: POST /api/waitlist${NC}"
echo ""

curl -X POST http://localhost:3036/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "waitlist@example.com",
    "fullName": "Test User",
    "planName": "OrderFlow Pro"
  }' \
  -w "\n\nStatus Code: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "${GREEN}✓ Check your inbox (waitlist@example.com) for:${NC}"
echo "  1. Waitlist confirmation with position number"
echo ""
echo "Press Enter when ready to continue..."
read

# Test 3: Check Waitlist Stats
echo ""
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${CYAN}Test 3: Waitlist Stats${NC}"
echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${YELLOW}Testing: GET /api/waitlist${NC}"
echo ""

curl http://localhost:3036/api/waitlist -s | jq '.'

echo ""
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}✅ Testing Complete!${NC}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "1. Check Supabase Table Editor:"
echo "   - members table (should have test@example.com)"
echo "   - waitlist table (should have waitlist@example.com)"
echo ""
echo "2. Monitor emails at: https://resend.com/emails"
echo ""
echo "3. If tests passed, your pipelines are ready! 🚀"
echo ""
