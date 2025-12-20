#!/bin/bash

# 🧹 ADMIN PANEL CLEANUP SCRIPT
# This script removes all dead/unused admin routes

echo "🧹 Starting Admin Panel Cleanup..."
echo "=================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for deletions
DELETED=0

# Function to safely delete a directory
safe_delete() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo -e "${YELLOW}Deleting:${NC} $dir"
        rm -rf "$dir"
        ((DELETED++))
        echo -e "${GREEN}✓ Deleted${NC}"
    else
        echo -e "${RED}✗ Not found:${NC} $dir"
    fi
    echo ""
}

echo "📋 Step 1: Deleting ENTIRE disabled routes folder..."
echo "---------------------------------------------------"
safe_delete "_disabled_admin_routes"

echo ""
echo "📋 Step 2: Deleting unused active admin routes..."
echo "---------------------------------------------------"

# Delete unused admin routes
safe_delete "app/admin/data-pipeline"
safe_delete "app/admin/ib-gateway"
safe_delete "app/admin/market-data"
safe_delete "app/admin/paper-trading-config"
safe_delete "app/admin/quick-login"
safe_delete "app/admin/setup"
safe_delete "app/admin/swing-positions"

echo ""
echo "=================================="
echo -e "${GREEN}✨ Cleanup Complete!${NC}"
echo "=================================="
echo ""
echo "📊 Summary:"
echo "  - Directories deleted: $DELETED"
echo ""
echo "✅ Your admin panel is now clean and focused!"
echo ""
echo "⚠️  NEXT STEPS:"
echo "  1. Test your admin dashboard: http://localhost:3036/admin"
echo "  2. Commit changes: git add . && git commit -m 'Clean up admin panel'"
echo "  3. Review ADMIN_CLEANUP_PLAN.md for audit decisions"
echo ""
echo "🚀 Ready for Phase 2: Community Features!"
echo ""
