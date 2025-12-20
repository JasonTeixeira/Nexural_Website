#!/bin/bash

# =============================================================================
# List All Environment Variables for Vercel
# =============================================================================

echo "📋 ENVIRONMENT VARIABLES FOR VERCEL"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Copy these from your .env.local file to Vercel:"
echo ""

cat << 'EOF'
✅ CRITICAL (Must Have):
───────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_URL
SUPABASE_ANON_KEY

✅ SERVICES (All Configured):
───────────────────────────────────────
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_SENTRY_DSN
RESEND_API_KEY
FROM_EMAIL
SUPPORT_EMAIL

✅ STRIPE (Payments):
───────────────────────────────────────
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_ORDERFLOW_PRODUCT_ID
NEXT_PUBLIC_STRIPE_ORDERFLOW_PRICE_ID

✅ DISCORD (Bot + Webhooks):
───────────────────────────────────────
DISCORD_BOT_TOKEN
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_GUILD_ID
DISCORD_BASIC_ROLE_ID
DISCORD_GENERAL_CHANNEL_ID
DISCORD_INVITE_URL
DISCORD_WEBHOOK_URL
DISCORD_WEBHOOK_SELLING
DISCORD_WEBHOOK_SWINGS

✅ MARKET DATA:
───────────────────────────────────────
DATABENTO_API_KEY
ALPACA_API_KEY
ALPACA_SECRET_KEY
ALPACA_BASE_URL

✅ OTHER:
───────────────────────────────────────
JWT_SECRET
NEXT_PUBLIC_ADMIN_USER_ID
WEBHOOK_SECRET
ENCRYPTION_KEY
NEXT_PUBLIC_YOUTUBE_API_KEY
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

⚠️  UPDATE AFTER DEPLOYMENT:
───────────────────────────────────────
NEXT_PUBLIC_APP_URL
(Set this to your Vercel URL or custom domain)

═══════════════════════════════════════════════════════
TOTAL: 38 environment variables
═══════════════════════════════════════════════════════

💡 HOW TO ADD THEM TO VERCEL:

1. Go to: https://vercel.com/dashboard
2. Select your project: Nexural_Website
3. Click "Settings" → "Environment Variables"
4. For each variable:
   - Copy the NAME from this list
   - Copy the VALUE from your .env.local file
   - Select all three: Production, Preview, Development
   - Click "Add"
5. After adding all variables, redeploy your project

🚀 QUICK TIP:
You can open .env.local and Vercel side-by-side to copy-paste faster!

EOF

echo ""
echo "📁 Your .env.local file is located at:"
echo "   /Users/Sage/Desktop/Projects/Nexural_Trading/.env.local"
echo ""
