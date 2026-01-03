#!/bin/bash

# Fix Imports After Reorganization
# Updates import paths for moved components

echo "🔧 Fixing imports after reorganization..."
echo "========================================"
echo ""

# Define the mappings
declare -A component_mappings=(
    # Marketing components
    ["@/components/hero-section"]="@/components/marketing/hero-section"
    ["@/components/pricing-section"]="@/components/marketing/pricing-section"
    ["@/components/pricing-section-enhanced"]="@/components/marketing/pricing-section-enhanced"
    ["@/components/pricing-tiers"]="@/components/marketing/pricing-tiers"
    ["@/components/pricing-hero"]="@/components/marketing/pricing-hero"
    ["@/components/pricing-cta"]="@/components/marketing/pricing-cta"
    ["@/components/pricing-faq"]="@/components/marketing/pricing-faq"
    ["@/components/simple-pricing-faq"]="@/components/marketing/simple-pricing-faq"
    ["@/components/final-pricing-cta"]="@/components/marketing/final-pricing-cta"
    ["@/components/cta-section"]="@/components/marketing/cta-section"
    ["@/components/enhanced-cta-section"]="@/components/marketing/enhanced-cta-section"
    ["@/components/testimonial-carousel"]="@/components/marketing/testimonial-carousel"
    ["@/components/testimonial-grid-section"]="@/components/marketing/testimonial-grid-section"
    ["@/components/testimonials-carousel"]="@/components/marketing/testimonials-carousel"
    ["@/components/testimonials-section"]="@/components/marketing/testimonials-section"
    ["@/components/large-testimonial"]="@/components/marketing/large-testimonial"
    ["@/components/video-testimonials"]="@/components/marketing/video-testimonials"
    ["@/components/video-testimonials-real"]="@/components/marketing/video-testimonials-real"
    ["@/components/how-it-works-hero"]="@/components/marketing/how-it-works-hero"
    ["@/components/how-it-works-section"]="@/components/marketing/how-it-works-section"
    ["@/components/trust-badges"]="@/components/marketing/trust-badges"
    ["@/components/trust-indicators"]="@/components/marketing/trust-indicators"
    ["@/components/trust-signals-section"]="@/components/marketing/trust-signals-section"
    ["@/components/social-proof\""]="@/components/marketing/social-proof\""
    ["@/components/social-proof-section"]="@/components/marketing/social-proof-section"
    ["@/components/social-proof-notifications"]="@/components/marketing/social-proof-notifications"
    ["@/components/value-stack-section"]="@/components/marketing/value-stack-section"
    ["@/components/value-breakdown"]="@/components/marketing/value-breakdown"
    ["@/components/value-proposition-charts"]="@/components/marketing/value-proposition-charts"
    ["@/components/bento-section"]="@/components/marketing/bento-section"
    ["@/components/as-featured-in-section"]="@/components/marketing/as-featured-in-section"
    ["@/components/who-this-is-for"]="@/components/marketing/who-this-is-for"
    ["@/components/decision-framework"]="@/components/marketing/decision-framework"
    ["@/components/founder-intro"]="@/components/marketing/founder-intro"
    ["@/components/founder-journey-timeline"]="@/components/marketing/founder-journey-timeline"
    ["@/components/historical-evidence"]="@/components/marketing/historical-evidence"
    ["@/components/no-bs-promise"]="@/components/marketing/no-bs-promise"
    ["@/components/financial-literacy-section"]="@/components/marketing/financial-literacy-section"
    ["@/components/educational-preview"]="@/components/marketing/educational-preview"
    ["@/components/getting-started-journey"]="@/components/marketing/getting-started-journey"
    ["@/components/dashboard-mockup"]="@/components/marketing/dashboard-mockup"
    ["@/components/dashboard-preview"]="@/components/marketing/dashboard-preview"
    ["@/components/system-visualization"]="@/components/marketing/system-visualization"
    ["@/components/ai-process-visualization"]="@/components/marketing/ai-process-visualization"
    ["@/components/risk-management-section"]="@/components/marketing/risk-management-section"
    ["@/components/risk-disclaimer"]="@/components/marketing/risk-disclaimer"
    ["@/components/legal-disclaimers"]="@/components/marketing/legal-disclaimers"
    ["@/components/faq-accordion"]="@/components/marketing/faq-accordion"
    ["@/components/faq-accordion-inline"]="@/components/marketing/faq-accordion-inline"
    ["@/components/faq-hero"]="@/components/marketing/faq-hero"
    ["@/components/faq-section"]="@/components/marketing/faq-section"
    ["@/components/faq-contact"]="@/components/marketing/faq-contact"
    
    # Social components
    ["@/components/community-activity-feed"]="@/components/social/community-activity-feed"
    ["@/components/community-showcase"]="@/components/social/community-showcase"
    ["@/components/community-showcase-homepage"]="@/components/social/community-showcase-homepage"
    ["@/components/live-activity-feed"]="@/components/social/live-activity-feed"
    ["@/components/live-positions-ticker"]="@/components/social/live-positions-ticker"
    
    # Position components
    ["@/components/admin-positions-feed"]="@/components/positions/admin-positions-feed"
    ["@/components/swing-positions-widget"]="@/components/positions/swing-positions-widget"
    ["@/components/performance-charts"]="@/components/positions/performance-charts"
    ["@/components/performance-dashboard"]="@/components/positions/performance-dashboard"
    ["@/components/critical-metrics-grid"]="@/components/positions/critical-metrics-grid"
    
    # Gamification
    ["@/components/scoring-system"]="@/components/gamification/scoring-system"
    
    # Lead capture
    ["@/components/lead-magnet-popup"]="@/components/lead-capture/lead-magnet-popup"
    ["@/components/free-lead-magnet-section"]="@/components/lead-capture/free-lead-magnet-section"
    ["@/components/exit-intent-popup"]="@/components/lead-capture/exit-intent-popup"
    ["@/components/exit-popup"]="@/components/lead-capture/exit-popup"
    ["@/components/newsletter-signup"]="@/components/lead-capture/newsletter-signup"
    ["@/components/scarcity-indicators"]="@/components/lead-capture/scarcity-indicators"
    ["@/components/urgency-banner"]="@/components/lead-capture/urgency-banner"
    ["@/components/urgency-timer"]="@/components/lead-capture/urgency-timer"
    ["@/components/conversion-tracking"]="@/components/lead-capture/conversion-tracking"
    
    # Algo trading
    ["@/components/algo-trading-hero-banner"]="@/components/algo-trading/algo-trading-hero-banner"
    ["@/components/algo-trading-section"]="@/components/algo-trading/algo-trading-section"
    ["@/components/algo-trading-waitlist-card"]="@/components/algo-trading/algo-trading-waitlist-card"
    
    # Referrals
    ["@/components/referral-dashboard"]="@/components/referrals/referral-dashboard"
    ["@/components/referral-share-buttons"]="@/components/referrals/referral-share-buttons"
    
    # Lib files
    ["@/lib/algo-trading-gamification"]="@/lib/gamification/algo-trading-gamification"
    ["@/lib/algo-trading-referral-system"]="@/lib/referrals/algo-trading-referral-system"
    ["@/lib/affiliate-service"]="@/lib/referrals/affiliate-service"
)

# Also handle relative imports
declare -A relative_mappings=(
    ["\"./hero-section"]="\"./marketing/hero-section"
    ["\"./pricing-section"]="\"./marketing/pricing-section"
    ["\"./testimonial"]="\"./marketing/testimonial"
    ["\"./community-activity-feed"]="\"./social/community-activity-feed"
    ["\"./referral-dashboard"]="\"./referrals/referral-dashboard"
    ["\"./referral-share-buttons"]="\"./referrals/referral-share-buttons"
)

# Find and fix imports in all TypeScript/JavaScript files
echo "📝 Updating imports in files..."
echo ""

# Update absolute imports (@/ paths)
for old_path in "${!component_mappings[@]}"; do
    new_path="${component_mappings[$old_path]}"
    echo "  Replacing: $old_path → $new_path"
    
    # Use sed to replace in all .tsx, .ts, .jsx, .js files
    find app components lib -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
        -exec sed -i '' "s|${old_path}|${new_path}|g" {} \; 2>/dev/null || true
done

echo ""
echo "✅ Import updates complete!"
echo ""
echo "🔍 Next steps:"
echo "  1. Run: npm run build"
echo "  2. Check for any remaining import errors"
echo "  3. Fix manually if needed"
echo "  4. Commit changes"
echo ""
