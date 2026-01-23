# SSOT Phase Completion Matrix (generated 2026-01-21T17:05:28.834Z)

This is a pragmatic “are we done?” view aligned to **docs/REFACTOR_PLAN.md** and **docs/SSOT_DONE_CHECKLIST.md**.

## Phase status

### Phase 1 — Canonical trading ledger + events
- **Status:** 🟡 Mostly implemented (needs invariants + legacy cleanup)
- **Evidence:**
  - lib/trading-ledger/*
  - app/api/admin/positions/*
  - app/api/member/positions/*
  - supabase/migrations/20260119_positions_backfill_flags.sql
- **Gaps:**
  - Legacy swing_positions still referenced (admin/unified-dashboard + member swing positions UI + admin swing-positions API)
  - Public teaser projection (hide entry/size) needs explicit verification (public admin positions endpoint/UI)
  - Backfill aging/exclusion rules enforcement should be verified end-to-end

### Phase 2 — Daily habit loop (follow-admin + feed + alerts + since-last-visit)
- **Status:** 🟡 Partial
- **Evidence:**
  - app/api/member/ssot-feed/route.ts
  - app/member-portal/feed/page.tsx
  - app/api/cron/ssot-alerts/route.ts
  - supabase/migrations/20260119_feed_last_seen.sql
- **Gaps:**
  - Follow-admin onboarding enforcement still not proven end-to-end (SSOT audit report: partial)
  - Since-last-visit UX/API behavior needs verification

### Phase 3 — Leaderboards + discovery
- **Status:** ✅ Implemented (v1)
- **Evidence:**
  - supabase/migrations/20260119_leaderboard_rollups.sql
  - app/api/cron/ssot-leaderboard-rollups/route.ts
  - app/api/member/leaderboard/route.ts
  - app/api/member/discovery/route.ts
- **Gaps:**
  - Eligibility rules (bio/tags + minimum activity thresholds) should be confirmed/implemented

### Phase 4 — Journaling depth + CSV import
- **Status:** 🟡 Partial/unclear
- **Evidence:**
  - app/member-portal/portfolio/page.tsx
  - app/member-portal/analytics/page.tsx
- **Gaps:**
  - Journal prompts + screenshots + import templates per SSOT not fully audited

### Phase 5 — Marketplace polish
- **Status:** 🟡 Implemented (MVP), polish missing
- **Evidence:**
  - supabase/migrations/20260120_marketplace_core.sql
  - app/marketplace/*
  - app/api/public/marketplace/products/route.ts
  - app/api/member/marketplace/*
  - app/api/webhooks/stripe-marketplace/route.ts
- **Gaps:**
  - Reviews/ratings endpoints + UI (verified purchasers only)
  - Reports/disputes + admin governance tooling


## SSOT punch list (next actions)

- **P0** — Implement follow-admin onboarding gate end-to-end + add e2e test (SSOT Phase 2 blocker).
- **P0** — Eliminate/route legacy swing_positions reads/writes; ensure admin + member “positions” are backed by canonical ledger (Phase 1 parity).
- **P1** — Verify public admin positions teaser cannot leak entry/size inference (public endpoint + UI projection).
- **P1** — Confirm backfill/import flags + leaderboard exclusion/aging rules are enforced (14 day policy) and covered by tests.
- **P2** — Marketplace polish: reviews/ratings (verified purchasers) + reports/disputes + admin governance UI.
- **P2** — Journaling/CSV import: confirm SSOT templates, screenshot support, and prompts exist or mark as Phase 4 incomplete.
