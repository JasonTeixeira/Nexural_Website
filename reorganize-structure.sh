#!/bin/bash

# Nexural Trading Platform Reorganization Script
# Purpose: Organize components into logical groups for better maintainability

set -e

echo "🔧 Starting Project Reorganization..."
echo "====================================="
echo ""

# Create new organized directories
echo "📁 Creating organized directory structure..."
mkdir -p components/marketing
mkdir -p components/social
mkdir -p components/positions
mkdir -p components/gamification
mkdir -p components/admin
mkdir -p lib/gamification
mkdir -p lib/referrals
mkdir -p lib/discord
mkdir -p docs
echo ""

# Function to move files
move_component() {
    local src=$1
    local dest=$2
    if [ -f "$src" ]; then
        echo "  ➡️  Moving: $src → $dest"
        mv "$src" "$dest"
    fi
}

echo "📦 PHASE 1: Organizing Marketing Components"
echo "-------------------------------------------"
move_component "components/hero-section.tsx" "components/marketing/"
move_component "components/pricing-section.tsx" "components/marketing/"
move_component "components/pricing-section-enhanced.tsx" "components/marketing/"
move_component "components/pricing-tiers.tsx" "components/marketing/"
move_component "components/pricing-hero.tsx" "components/marketing/"
move_component "components/pricing-cta.tsx" "components/marketing/"
move_component "components/pricing-faq.tsx" "components/marketing/"
move_component "components/simple-pricing-faq.tsx" "components/marketing/"
move_component "components/final-pricing-cta.tsx" "components/marketing/"
move_component "components/cta-section.tsx" "components/marketing/"
move_component "components/enhanced-cta-section.tsx" "components/marketing/"
move_component "components/testimonial-carousel.tsx" "components/marketing/"
move_component "components/testimonial-grid-section.tsx" "components/marketing/"
move_component "components/testimonials-carousel.tsx" "components/marketing/"
move_component "components/testimonials-section.tsx" "components/marketing/"
move_component "components/large-testimonial.tsx" "components/marketing/"
move_component "components/video-testimonials.tsx" "components/marketing/"
move_component "components/video-testimonials-real.tsx" "components/marketing/"
move_component "components/how-it-works-hero.tsx" "components/marketing/"
move_component "components/how-it-works-section.tsx" "components/marketing/"
move_component "components/trust-badges.tsx" "components/marketing/"
move_component "components/trust-indicators.tsx" "components/marketing/"
move_component "components/trust-signals-section.tsx" "components/marketing/"
move_component "components/social-proof.tsx" "components/marketing/"
move_component "components/social-proof-section.tsx" "components/marketing/"
move_component "components/social-proof-notifications.tsx" "components/marketing/"
move_component "components/value-stack-section.tsx" "components/marketing/"
move_component "components/value-breakdown.tsx" "components/marketing/"
move_component "components/value-proposition-charts.tsx" "components/marketing/"
move_component "components/bento-section.tsx" "components/marketing/"
move_component "components/as-featured-in-section.tsx" "components/marketing/"
move_component "components/who-this-is-for.tsx" "components/marketing/"
move_component "components/decision-framework.tsx" "components/marketing/"
move_component "components/founder-intro.tsx" "components/marketing/"
move_component "components/founder-journey-timeline.tsx" "components/marketing/"
move_component "components/historical-evidence.tsx" "components/marketing/"
move_component "components/no-bs-promise.tsx" "components/marketing/"
move_component "components/financial-literacy-section.tsx" "components/marketing/"
move_component "components/educational-preview.tsx" "components/marketing/"
move_component "components/getting-started-journey.tsx" "components/marketing/"
move_component "components/dashboard-mockup.tsx" "components/marketing/"
move_component "components/dashboard-preview.tsx" "components/marketing/"
move_component "components/system-visualization.tsx" "components/marketing/"
move_component "components/ai-process-visualization.tsx" "components/marketing/"
move_component "components/risk-management-section.tsx" "components/marketing/"
move_component "components/risk-disclaimer.tsx" "components/marketing/"
move_component "components/legal-disclaimers.tsx" "components/marketing/"
move_component "components/faq-accordion.tsx" "components/marketing/"
move_component "components/faq-accordion-inline.tsx" "components/marketing/"
move_component "components/faq-hero.tsx" "components/marketing/"
move_component "components/faq-section.tsx" "components/marketing/"
move_component "components/faq-contact.tsx" "components/marketing/"
echo ""

echo "📦 PHASE 2: Organizing Social Components"
echo "----------------------------------------"
move_component "components/community-activity-feed.tsx" "components/social/"
move_component "components/community-showcase.tsx" "components/social/"
move_component "components/community-showcase-homepage.tsx" "components/social/"
move_component "components/live-activity-feed.tsx" "components/social/"
move_component "components/live-positions-ticker.tsx" "components/social/"
echo ""

echo "📦 PHASE 3: Organizing Position Components"
echo "------------------------------------------"
move_component "components/admin-positions-feed.tsx" "components/positions/"
move_component "components/swing-positions-widget.tsx" "components/positions/"
move_component "components/performance-charts.tsx" "components/positions/"
move_component "components/performance-dashboard.tsx" "components/positions/"
move_component "components/critical-metrics-grid.tsx" "components/positions/"
echo ""

echo "📦 PHASE 4: Organizing Gamification Components"
echo "----------------------------------------------"
move_component "components/scoring-system.tsx" "components/gamification/"
echo ""

echo "📦 PHASE 5: Organizing Lead Capture Components"
echo "----------------------------------------------"
mkdir -p components/lead-capture
move_component "components/lead-magnet-popup.tsx" "components/lead-capture/"
move_component "components/free-lead-magnet-section.tsx" "components/lead-capture/"
move_component "components/exit-intent-popup.tsx" "components/lead-capture/"
move_component "components/exit-popup.tsx" "components/lead-capture/"
move_component "components/newsletter-signup.tsx" "components/lead-capture/"
move_component "components/scarcity-indicators.tsx" "components/lead-capture/"
move_component "components/urgency-banner.tsx" "components/lead-capture/"
move_component "components/urgency-timer.tsx" "components/lead-capture/"
move_component "components/conversion-tracking.tsx" "components/lead-capture/"
echo ""

echo "📦 PHASE 6: Organizing Algo Trading Waitlist Components"
echo "-------------------------------------------------------"
mkdir -p components/algo-trading
move_component "components/algo-trading-hero-banner.tsx" "components/algo-trading/"
move_component "components/algo-trading-section.tsx" "components/algo-trading/"
move_component "components/algo-trading-waitlist-card.tsx" "components/algo-trading/"
echo ""

echo "📦 PHASE 7: Organizing Referral Components"
echo "------------------------------------------"
mkdir -p components/referrals
move_component "components/referral-dashboard.tsx" "components/referrals/"
move_component "components/referral-share-buttons.tsx" "components/referrals/"
echo ""

echo "📦 PHASE 8: Organizing Lib Files"
echo "--------------------------------"
move_component "lib/algo-trading-gamification.ts" "lib/gamification/"
move_component "lib/algo-trading-referral-system.ts" "lib/referrals/"
move_component "lib/affiliate-service.ts" "lib/referrals/"
echo ""

echo "✅ Reorganization Complete!"
echo "==========================="
echo ""
echo "📊 New Structure:"
echo "  components/"
echo "    ├── marketing/          # Landing page components"
echo "    ├── social/             # Community & social features"
echo "    ├── positions/          # Position tracking"
echo "    ├── gamification/       # Badges, points, levels"
echo "    ├── referrals/          # Referral system"
echo "    ├── lead-capture/       # Email capture, popups"
echo "    ├── algo-trading/       # Algo trading waitlist"
echo "    ├── admin/              # Admin dashboard"
echo "    └── ui/                 # Shared UI components"
echo ""
echo "  lib/"
echo "    ├── gamification/       # Gamification logic"
echo "    ├── referrals/          # Referral system logic"
echo "    ├── discord/            # Discord integration"
echo "    └── auth/               # Authentication"
echo ""
echo "⚠️  IMPORTANT: Update all imports in your files!"
echo "   Run: npm run build to check for import errors"
echo ""
