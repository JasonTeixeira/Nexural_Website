# Env Vars Inventory (generated 2026-01-21T20:43:47.076Z)

This file lists every `process.env.*` referenced in the repo and where to source it.

> ⚠️ Never commit real secrets. Use `.env.local` locally and Vercel env vars in staging/prod.

## Keys

### Stripe (test vs live)

This repo uses the standard Stripe env var names. When you switch from test → live,
replace the values in **Vercel Production** (and update webhook secrets too).

- `STRIPE_SECRET_KEY`
  - Test: `sk_test_...`
  - Live: `sk_live_...`
  - Used by: `lib/stripe.ts`

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - Test: `pk_test_...`
  - Live: `pk_live_...`
  - Used by: `lib/stripe.ts`

- `STRIPE_WEBHOOK_SECRET`
  - Test: `whsec_...` from Stripe CLI / test webhook endpoint
  - Live: `whsec_...` from Stripe dashboard → live webhook endpoint
  - Used by: `app/api/webhooks/stripe/route.ts`, `app/api/webhooks/stripe-marketplace/route.ts`

- `STRIPE_MARKETPLACE_WEBHOOK_SECRET` (optional legacy)
  - Used by: `app/api/webhooks/stripe-marketplace/route.ts`


### Redis / Rate limiting / Caching

- `UPSTASH_REDIS_REST_URL`
  - Source: Upstash Console → Redis DB → REST URL
  - Used by: `lib/redis-client.ts`, `lib/cache-service.ts`, `lib/rate-limiter.ts`

- `UPSTASH_REDIS_REST_TOKEN`
  - Source: Upstash Console → Redis DB → REST Token
  - Used by: `lib/redis-client.ts`, `lib/cache-service.ts`, `lib/rate-limiter.ts`

- `REDIS_URL` (optional alternative)
  - Source: Railway/standard Redis provider connection string
  - Used by: `lib/redis-client.ts`



## Where to look
- **Vercel**: Project → Settings → Environment Variables
- **Supabase**: Project Settings → API
- **Stripe**: Developers → API keys + Webhook endpoints
- **Sentry**: Project settings
- **Resend**: API keys
- **Discord**: Developer portal
- **Backblaze B2**: App keys
