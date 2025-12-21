#!/bin/bash

# Nexural Trading Platform Cleanup Script
# Purpose: Remove payment systems, automated trading, and ML features
# Keep: Social features, community, referrals, gamification, Discord webhooks

set -e  # Exit on error

echo "🧹 Starting Nexural Trading Platform Cleanup..."
echo "================================================"
echo ""

# Create archive directory
ARCHIVE_DIR="archived_code_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_DIR"
echo "📦 Archive directory created: $ARCHIVE_DIR"
echo ""

# Function to archive and remove
archive_and_remove() {
    local path=$1
    if [ -e "$path" ]; then
        echo "  📁 Archiving: $path"
        # Create parent directory structure in archive
        parent_dir=$(dirname "$path")
        mkdir -p "$ARCHIVE_DIR/$parent_dir"
        cp -r "$path" "$ARCHIVE_DIR/$path" 2>/dev/null || true
        rm -rf "$path"
        echo "  ✅ Removed: $path"
    fi
}

echo "🔴 PHASE 1: Removing Payment System (Stripe)"
echo "---------------------------------------------"
archive_and_remove "app/api/stripe"
archive_and_remove "app/api/create-checkout-session"
archive_and_remove "app/api/billing-portal"
archive_and_remove "app/member-portal/subscription"
archive_and_remove "components/subscribe"
echo ""

echo "🔴 PHASE 2: Removing IB Gateway & Automated Trading"
echo "---------------------------------------------------"
archive_and_remove "app/api/admin/ib-gateway"
archive_and_remove "app/api/admin/paper-trading-config"
archive_and_remove "app/api/admin/sim-accounts"
archive_and_remove "lib/always-connected-ib-service.ts"
archive_and_remove "lib/ib-gateway-connection-manager-pro.ts"
archive_and_remove "lib/broker-integration-manager.ts"
archive_and_remove "lib/alpaca-client.ts"
echo ""

echo "🔴 PHASE 3: Removing ML/AI Signal Generation"
echo "--------------------------------------------"
archive_and_remove "app/api/cron/ml-signal-generation"
archive_and_remove "app/api/cron/weekly-ml-training"
archive_and_remove "app/api/cron/hourly-feature-generation"
archive_and_remove "app/api/admin/signal-generator"
archive_and_remove "app/api/admin/signal-execution-summary"
echo ""

echo "🔴 PHASE 4: Removing Over-Engineered Admin Tools"
echo "------------------------------------------------"
archive_and_remove "app/api/admin/cron-manager"
archive_and_remove "app/api/admin/database-performance"
archive_and_remove "app/api/admin/disaster-recovery"
archive_and_remove "app/api/admin/position-monitor"
archive_and_remove "app/api/admin/create-test-member"
archive_and_remove "components/testing-dashboard.tsx"
archive_and_remove "components/launch-checklist.tsx"
archive_and_remove "components/launch-status.tsx"
archive_and_remove "components/final-deployment-status.tsx"
echo ""

echo "🔴 PHASE 5: Removing 2FA (Simplify for Free Platform)"
echo "-----------------------------------------------------"
archive_and_remove "app/api/auth/2fa"
archive_and_remove "app/api/member/2fa"
archive_and_remove "app/member-portal/2fa-setup"
echo ""

echo "🔴 PHASE 6: Cleaning Up Unused Components"
echo "-----------------------------------------"
archive_and_remove "components/ab-test-wrapper.tsx"
archive_and_remove "components/accessibility-improvements.tsx"
archive_and_remove "lib/backblaze-storage.ts"
echo ""

echo "✅ Cleanup Complete!"
echo "===================="
echo ""
echo "📊 Summary:"
echo "  - Payment system removed (Stripe)"
echo "  - IB Gateway & automated trading removed"
echo "  - ML/AI features removed"
echo "  - Over-engineered admin tools removed"
echo "  - 2FA system removed (simplification)"
echo ""
echo "📦 Archived code location: $ARCHIVE_DIR"
echo ""
echo "🎯 Your platform is now focused on:"
echo "  ✅ Free social trading"
echo "  ✅ Community & following"
echo "  ✅ Leaderboards & gamification"
echo "  ✅ Referral/affiliate system"
echo "  ✅ Discord notifications"
echo "  ✅ Watchlist tracking"
echo ""
echo "🚀 Next steps:"
echo "  1. Review the changes: git status"
echo "  2. Run the reorganization script: ./reorganize-structure.sh"
echo "  3. Review architecture docs: docs/ARCHITECTURE.md"
echo "  4. Test the platform: npm run dev"
echo "  5. Deploy to Vercel"
echo ""
