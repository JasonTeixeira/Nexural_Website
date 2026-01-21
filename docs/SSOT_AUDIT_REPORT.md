# SSOT Audit Report

Generated: 2026-01-20T22:24:18.568Z

Tie-breaker policy: **`docs/SSOT_DONE_CHECKLIST.md` wins** when docs conflict.

Legend: ✅ implemented, 🟡 partial, ❌ missing, ❓ not audited yet.

This is a first-pass **requirements → implementation** matrix focused on the SSOT checklist + Tier‑1 specs.

---

## Checklist: Onboarding gate: follow admin required
- **SSOT:** `docs/SSOT_DONE_CHECKLIST.md` (1) + `docs/PERMISSIONS_PRIVACY.md`
- **Status:** 🟡 Partial

**Evidence (files):**
- `app/auth/callback/route.ts` (contains explicit SSOT comment about follow-admin requirement)

**Gap:** need to verify follow relationship creation/enforcement end-to-end during onboarding (and add test coverage).

**Next:** audit signup/onboarding flow + add e2e test proving enforcement.

---

## Permissions/Privacy: Global portfolio visibility mode enforced
- **SSOT:** `docs/PERMISSIONS_PRIVACY.md`
- **Status:** ✅ Implemented

**Evidence (files):**
- `supabase/migrations/20260119_portfolio_visibility_mode.sql`
- `app/profile/[username]/page.tsx`
- `app/portfolio/[id]/page.tsx`
- `app/api/member/leaderboard/route.ts` (filters private)
- `app/api/member/discovery/route.ts` (filters private)

---

## Trading Ledger + Events: Canonical event spine (`position_events`) + opened/closed/amended
- **SSOT:** `docs/EVENT_TAXONOMY.md` + `docs/TRADING_LEDGER_SPEC.md`
- **Status:** ✅ Implemented

**Evidence (files):**
- `app/api/member/positions/route.ts` (emits `position.opened`)
- `app/api/member/positions/[id]/close/route.ts` (emits `position.closed`)
- `app/api/member/positions/[id]/route.ts` (emits `position.amended`)
- `app/api/admin/positions/route.ts` (writes `position_events`)
- `app/api/admin/positions/[id]/event/route.ts` (writes `position_events`)

---

## Feed (Tier‑1): SSOT feed endpoint (following mode)
- **SSOT:** `docs/FEED_ALERTS_SPEC.md`
- **Status:** ✅ Implemented

**Evidence (files):**
- `app/api/member/ssot-feed/route.ts`
- `app/member-portal/feed/page.tsx` (uses `/api/member/ssot-feed`)

---

## Alerts (Tier‑1): Event-driven alerts cron + preferences
- **SSOT:** `docs/FEED_ALERTS_SPEC.md`
- **Status:** ✅ Implemented (v1)

**Evidence (files):**
- `app/api/cron/ssot-alerts/route.ts`
- `supabase/migrations/20260119_alert_preferences.sql`
- `app/api/cron/ssot-alerts/__tests__/ssot-alerts.test.ts`

**Gap:** validate scaling assumptions (25k members) + retry semantics beyond “best effort”.

---

## Leaderboards (Tier‑1): Rollups computed via cron + read APIs; privacy filters applied
- **SSOT:** `docs/LEADERBOARD_DISCOVERY_SPEC.md`
- **Status:** ✅ Implemented (v1)

**Evidence (files):**
- `supabase/migrations/20260119_leaderboard_rollups.sql`
- `app/api/cron/ssot-leaderboard-rollups/route.ts`
- `app/api/member/leaderboard/route.ts`
- `app/api/member/discovery/route.ts`

---

## Referrals/Points (Tier‑1): Referral capture + points awarding cron + anti-fraud gate
- **SSOT:** `docs/REFERRALS_POINTS_SPEC.md`
- **Status:** ✅ Implemented (needs migration/RLS verification)

**Evidence (files):**
- `app/api/member/referrals/route.ts`
- `app/api/cron/ssot-referral-awards/route.ts`
- `app/api/cron/ssot-referral-awards/__tests__/ssot-referral-awards.test.ts`
- `lib/api-rate-limit.ts` (`enforceReferralConsumeRateLimit`)

**Gap:** confirm migrations exist for `referral_codes`/`referral_events`/`points_ledger`/`points_balances` and RLS aligns with SSOT.

---

## Newsletter (Tier‑1): Subscribe/unsubscribe + send idempotency + click tracking
- **SSOT:** `docs/NEWSLETTER_SPEC.md`
- **Status:** ✅ Implemented

**Evidence (files):**
- `app/api/newsletter/subscribers/route.ts`
- `app/api/newsletter/unsubscribe/route.ts`
- `app/api/newsletter/unsubscribe/__tests__/unsubscribe.test.ts`
- `app/api/admin/newsletter/send-v2/route.ts`
- `supabase/migrations/20260120_newsletter_send_idempotency.sql`
- `app/r/[code]/route.ts`
- `app/r/[code]/__tests__/newsletter-click.test.ts`

---

## Marketplace (Tier‑1): Marketplace requirements
- **SSOT:** `docs/MARKETPLACE_SPEC.md`
- **Status:** ❌ Missing (not implemented)

**Evidence (files):**
- `app/marketplace/**` (does not exist)
- `supabase/migrations/**` (no marketplace/product/listing/order/license tables found)
- `app/api/**` (no marketplace endpoints found)
- `app/api/webhooks/stripe/route.ts` exists, but does not implement marketplace purchase→license issuance.

**Gap:** The entire marketplace domain required by SSOT is currently absent:
- Seller onboarding (profile + payout setup + terms agreement)
- Product listing model (types, attributes, versioning)
- Purchase records + license/entitlement issuance + downloads
- Revenue share rules (20% fee)
- Reviews/ratings (verified purchasers only)
- Admin governance tooling
- Webhook-driven confirmation + retries + idempotency + audit logs
- Public browsing vs member-only purchase/download

**Next:** Implement Marketplace MVP per `docs/MARKETPLACE_SPEC.md` (schema + routes + pages), then re-run audit.

---

## Prioritized remediation plan (Phase 1 first)
1) **Phase 1: Canonical ledger + events** — tighten invariants from `TRADING_LEDGER_SPEC.md` (legs, required fields, integrity events).
2) **Onboarding follow-admin gate** — implement/verify end-to-end + add tests.
3) **Marketplace** — complete audit + implement missing pieces.
4) **Deletion gates** — enforce `KEEP_MIGRATE_DELETE.md` before any safe deletion.
