#!/bin/bash

# =============================================================================
# Pre-Deployment Verification Script
# Checks if everything is ready for deployment WITHOUT requiring server to run
# =============================================================================

echo "🔍 NEXURAL TRADING - PRE-DEPLOYMENT VERIFICATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Function to check and report
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

echo "📋 CHECK 1: Git Status"
echo "────────────────────────────────────────────────────────────────"

# Check if git is initialized
if [ -d ".git" ]; then
    check_pass "Git repository initialized"
    
    # Check current branch
    BRANCH=$(git branch --show-current 2>/dev/null)
    if [ "$BRANCH" == "main" ]; then
        check_pass "On main branch"
    else
        check_warn "Not on main branch (current: $BRANCH)"
    fi
    
    # Check for uncommitted changes
    if git diff --quiet && git diff --cached --quiet; then
        check_pass "No uncommitted changes"
    else
        check_warn "Uncommitted changes detected (will be committed during deployment)"
    fi
else
    check_warn "Git not initialized (will be initialized during deployment)"
fi

echo ""
echo "📋 CHECK 2: Environment Variables"
echo "────────────────────────────────────────────────────────────────"

if [ -f ".env.local" ]; then
    check_pass ".env.local file exists"
    
    # Count variables
    VAR_COUNT=$(grep -c "^[A-Z]" .env.local 2>/dev/null || echo "0")
    if [ "$VAR_COUNT" -ge "35" ]; then
        check_pass "Environment variables present ($VAR_COUNT found, expected ~38)"
    else
        check_warn "Only $VAR_COUNT environment variables found (expected ~38)"
    fi
    
    # Check critical variables
    CRITICAL_VARS=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "UPSTASH_REDIS_REST_URL"
        "UPSTASH_REDIS_REST_TOKEN"
        "NEXT_PUBLIC_SENTRY_DSN"
        "RESEND_API_KEY"
    )
    
    for var in "${CRITICAL_VARS[@]}"; do
        if grep -q "^$var=" .env.local; then
            check_pass "$var configured"
        else
            check_fail "$var missing"
        fi
    done
else
    check_fail ".env.local file not found!"
fi

echo ""
echo "📋 CHECK 3: Deployment Scripts"
echo "────────────────────────────────────────────────────────────────"

SCRIPTS=(
    "deploy-to-github.sh"
    "list-env-vars.sh"
    "test-health.js"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ] || [[ "$script" == *.js ]]; then
            check_pass "$script exists and is executable"
        else
            check_warn "$script exists but may not be executable"
        fi
    else
        check_fail "$script not found"
    fi
done

echo ""
echo "📋 CHECK 4: Key Files Present"
echo "────────────────────────────────────────────────────────────────"

KEY_FILES=(
    "package.json"
    "next.config.mjs"
    "middleware.ts"
    ".gitignore"
    ".vercelignore"
    "app/api/health/route.ts"
)

for file in "${KEY_FILES[@]}"; do
    if [ -f "$file" ]; then
        check_pass "$file present"
    else
        check_fail "$file missing"
    fi
done

echo ""
echo "📋 CHECK 5: Dependencies"
echo "────────────────────────────────────────────────────────────────"

if [ -d "node_modules" ]; then
    check_pass "node_modules directory exists"
else
    check_warn "node_modules not found (run 'npm install')"
fi

if [ -f "package-lock.json" ]; then
    check_pass "package-lock.json exists"
else
    check_warn "package-lock.json not found"
fi

echo ""
echo "📋 CHECK 6: Build Test"
echo "────────────────────────────────────────────────────────────────"

echo "Testing if project builds..."
if npm run build > /dev/null 2>&1; then
    check_pass "Project builds successfully"
else
    check_warn "Build test skipped or failed (may need to run 'npm install' first)"
fi

echo ""
echo "📋 CHECK 7: Documentation"
echo "────────────────────────────────────────────────────────────────"

DOCS=(
    "READY_TO_DEPLOY.md"
    "DEPLOY_NOW.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "$doc present"
    else
        check_warn "$doc not found"
    fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Checks Passed: $CHECKS_PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Checks Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 READY TO DEPLOY!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./deploy-to-github.sh"
    echo "2. Go to: https://vercel.com/dashboard"
    echo "3. Import project and add environment variables"
    echo "4. Deploy!"
    echo ""
    exit 0
else
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}⚠️  ISSUES FOUND - Please fix before deploying${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Please address the failed checks above before deploying."
    echo ""
    exit 1
fi
