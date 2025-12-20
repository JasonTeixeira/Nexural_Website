#!/bin/bash

# =============================================================================
# Deploy Nexural Trading to GitHub
# =============================================================================

echo "🚀 Deploying Nexural Trading to GitHub..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/JasonTeixeira/Nexural_Website.git"

echo "📋 Step 1: Checking current git status..."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "${YELLOW}⚠️  Git not initialized. Initializing...${NC}"
    git init
    echo "${GREEN}✅ Git initialized${NC}"
else
    echo "${GREEN}✅ Git already initialized${NC}"
fi

echo ""
echo "📋 Step 2: Checking for uncommitted changes..."
echo ""

# Add all files
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "${GREEN}✅ No new changes to commit${NC}"
else
    echo "${YELLOW}📝 Committing changes...${NC}"
    git commit -m "Production ready - all services configured (Database, Redis, Email, Sentry)"
    echo "${GREEN}✅ Changes committed${NC}"
fi

echo ""
echo "📋 Step 3: Configuring remote repository..."
echo ""

# Remove existing origin if it exists
if git remote | grep -q "^origin$"; then
    echo "${YELLOW}⚠️  Removing existing origin...${NC}"
    git remote remove origin
fi

# Add new origin
echo "Adding remote: $REPO_URL"
git remote add origin "$REPO_URL"
echo "${GREEN}✅ Remote configured${NC}"

echo ""
echo "📋 Step 4: Setting up main branch..."
echo ""

# Ensure we're on main branch
git branch -M main
echo "${GREEN}✅ Main branch configured${NC}"

echo ""
echo "📋 Step 5: Pushing to GitHub..."
echo ""

# Push to GitHub
echo "${YELLOW}⚠️  This will push your code to GitHub.${NC}"
echo "Repository: $REPO_URL"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Pushing to GitHub..."
    
    if git push -u origin main --force; then
        echo ""
        echo "${GREEN}═══════════════════════════════════════════════════════${NC}"
        echo "${GREEN}🎉 SUCCESS! Code pushed to GitHub!${NC}"
        echo "${GREEN}═══════════════════════════════════════════════════════${NC}"
        echo ""
        echo "📍 Repository: $REPO_URL"
        echo ""
        echo "📋 NEXT STEPS:"
        echo ""
        echo "1. Go to https://vercel.com/dashboard"
        echo "2. Click 'Add New...' → 'Project'"
        echo "3. Import 'Nexural_Website' repository"
        echo "4. Add environment variables (see .env.local)"
        echo "5. Click 'Deploy'"
        echo ""
        echo "💡 TIP: Run './copy-env-vars.sh' to see all variables you need to add"
        echo ""
    else
        echo ""
        echo "${RED}❌ Failed to push to GitHub${NC}"
        echo ""
        echo "Common issues:"
        echo "1. Repository doesn't exist - create it at https://github.com/new"
        echo "2. No access - make sure you're logged in: gh auth login"
        echo "3. Wrong URL - verify the repository URL"
        echo ""
        exit 1
    fi
else
    echo ""
    echo "${YELLOW}❌ Deployment cancelled${NC}"
    exit 0
fi
