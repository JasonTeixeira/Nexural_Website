# SSOT Compliance Scorecard (WIP)

Generated: **2026-01-25**

Tie-breaker policy: **`docs/SSOT_DONE_CHECKLIST.md` wins** when docs conflict.

This scorecard is the living “single pane of glass” for:
- SSOT document compliance (1–100)
- Feature compliance (1–100)
- Route compliance (1–100)
- API compliance (1–100)

> Scoring rubric (per item):
> - Spec clarity/completeness (25)
> - Implementation parity (35)
> - Data/migrations/RLS parity (20)
> - Automated tests (15)
> - Ops readiness (5)
> Total = 100

---

## Current automated test status (baseline)

✅ `npm test` **PASS** (14 suites / 19 tests)

✅ `npm run build` **PASS with warnings**

✅ `npm run typecheck` **PASS**

### Build warnings / audit notes
- Next build prints multiple `Dynamic server usage` messages for API routes during prerender.
  - These are expected when Next tries to statically analyze routes with request-bound usage.
  - We will audit each referenced route to ensure runtime mode is intentional and configured correctly.
- Missing Redis configured (rate limiter fallback): acceptable for dev; for production SSOT “ops readiness” likely requires Redis.

---

## ✅ Production verification (Auth + Env + Redis)

Production endpoints verified:
- `GET https://www.nexural.io/api/health/env` → `ok:true` and required env keys present
- `GET https://www.nexural.io/api/health/redis` → `ok:true`, `configured:true`, `canReadWrite:true`
- `GET https://www.nexural.io/api/health` → overall `status: healthy` (Sentry still not configured)

Notes:
- OAuth env vars are present at runtime.
- Rate limiting is backed by Upstash Redis in production.
- Observability still missing: configure Sentry DSN.

---

## SSOT Document Scores (initial placeholder)

This repo has strong SSOT **infrastructure** (ledger/events/feed/alerts/leaderboards) but SSOT “done” is gated by:
- explicit product decisions in `SSOT_DONE_CHECKLIST.md` (many are still not locked)
- completing missing KEEP pages from inventory
- deleting legacy systems after traffic=0 windows

**Two numbers we track:**
- **Repo SSOT %:** implementation maturity of canonical systems + reduction of legacy couplings
- **Production SSOT %:** repo + ops readiness + observed behavior + deletion-gate windows

### Current headline scores
- **Repo SSOT:** **87 / 100**
- **Production SSOT:** **78 / 100**

Why production is lower than repo:
- deletion-gate window not yet satisfied (requires time)
- Sentry not configured (ops/observability)
- some KEEP pages are still missing (inventory drift)

| Document | Score | Status | Notes |
| --- | ---:| --- | --- |
| `docs/PRD.md` | 70 | 🟡 | Solid direction, but “done” decisions in SSOT checklist remain open. |
| `docs/ARCHITECTURE.md` | 80 | 🟡 | Good domain boundaries; some legacy endpoints still coexist. |
| `docs/DOMAIN_MODEL.md` | 80 | 🟡 | Canonical nouns present; a few legacy nouns persist (signals/swing_positions). |
| `docs/PERMISSIONS_PRIVACY.md` | 92 | ✅ | Global portfolio visibility mode enforced + filtered in APIs. |
| `docs/EVENT_TAXONOMY.md` | 90 | ✅ | Canonical event spine implemented (`position_events`). |
| `docs/TRADING_LEDGER_SPEC.md` | 85 | 🟡 | Ledger exists; remaining work: invariants + deletion of legacy trade models. |
| `docs/FEED_ALERTS_SPEC.md` | 88 | 🟡 | Feed+alerts implemented; verify “since-last-visit” UX and scaling/retry semantics. |
| `docs/LEADERBOARD_DISCOVERY_SPEC.md` | 90 | ✅ | Rollups + privacy filtering implemented (v1). |
| `docs/REFERRALS_POINTS_SPEC.md` | 82 | 🟡 | Implemented; still needs migration/RLS verification + admin tooling polish. |
| `docs/NEWSLETTER_SPEC.md` | 90 | ✅ | Subscribe/unsub + idempotency + click tracking implemented. |
| `docs/MARKETPLACE_SPEC.md` | 75 | 🟡 | MVP shipped; missing reviews/disputes + moderation governance UI. |
| `docs/KEEP_MIGRATE_DELETE.md` | 85 | 🟡 | Inventory exists; deletion-gate telemetry in place; waiting on traffic=0 windows. |
| `docs/DEPRECATION_DELETE_LIST.md` | 80 | 🟡 | Legacy inventory exists; deletions pending traffic window. |
| `docs/OPS_RUNBOOK.md` | 78 | 🟡 | Env/Redis verified in prod; Sentry still missing; add incident playbooks over time. |
| `docs/REFACTOR_PLAN.md` | 85 | 🟡 | Phases align; remaining work is executing deletion + missing feature pages. |

---

## Phase completion (from `SSOT_PHASE_COMPLETION.md`)

- **Phase 1 (Canonical ledger + events):** 🟡 Mostly implemented
  - Remaining: eliminate legacy models (`signals`, `swing_positions`, `live_trades`) and unify admin surfaces.
- **Phase 2 (Daily habit loop: follow-admin + feed + alerts):** 🟡 Partial
  - Remaining: prove follow-admin onboarding gate E2E; validate since-last-visit.
- **Phase 3 (Leaderboards + discovery):** ✅ Implemented (v1)
- **Phase 4 (Journaling + import):** 🟡 Partial/unclear
- **Phase 5 (Marketplace polish):** 🟡 MVP shipped, polish missing

---

## Current “Definition of Done” status (from `SSOT_DONE_CHECKLIST.md`)

The SSOT Done Checklist currently has **0/27 boxes checked** in the doc (meaning the decisions are not formally locked in writing yet).

Recommended next action: mark explicit decisions as agreed and check them off.

---

## Top remaining gaps to reach “fully SSOT compliant”

### P0 (blocks safe deletion / SSOT credibility)
1) **Deletion-gate telemetry visibility in Vercel logs**
   - We triggered a legacy endpoint, but Vercel Logs UI did not show `DELETION_GATE_HIT`.
   - Fix: ensure structured logs go to stdout (no logger swallowing), and verify in prod.
2) **Follow-admin onboarding gate: prove E2E**
   - Add an automated test that fails if onboarding can be completed without the follow.

### P1 (complete SSOT inventory + remove drift)
3) Implement missing KEEP pages or update SSOT inventory:
   - `/admin/moderation`, `/admin/referrals`, `/briefs/market-brief`, `/marketplace/products/[productId]`, `/marketplace/sellers`, `/marketplace/sellers/[sellerId]`,
     `/member-portal/following`, `/member-portal/messages`, `/member-portal/notifications`

### P2 (ops + polish)
4) Configure Sentry (health currently reports not configured)
5) Marketplace governance: reviews + disputes + admin moderation UI


---

## Route inventory (from `KEEP_MIGRATE_DELETE.md`)

Source: `docs/_ssot_inventory_generated.json`

| Category | Count |
| --- | ---: |
| Pages: KEEP | 48 |
| Pages: MIGRATE | 11 |
| Pages: REVIEW | 27 |
| APIs: KEEP_OR_REVIEW | 88 |
| APIs: MIGRATE | 1 |
| APIs: DELETE | 3 |
| APIs: DELETE_OR_ARCHIVE | 2 |
| APIs: REVIEW | 9 |

### Missing routes (gap vs SSOT inventory)

These are routes listed in `docs/KEEP_MIGRATE_DELETE.md` but do **not** exist in `app/` currently.

Source: `docs/_ssot_routes_missing.json`

#### Missing KEEP pages (must be implemented or SSOT updated)
- `/admin/moderation`
- `/admin/referrals`
- `/briefs/market-brief`
- `/marketplace/products/[productId]`
- `/marketplace/sellers`
- `/marketplace/sellers/[sellerId]`
- `/member-portal/following`
- `/member-portal/messages`
- `/member-portal/notifications`

#### Missing MIGRATE pages
- `/feed`

#### Missing REVIEW pages (need decision: implement vs consolidate vs remove)
- `/admin/build-status`
- `/member-portal/community`
- `/member-portal/journal/import`
- `/member-portal/marketplace/[productId]`
- `/member-portal/marketplace/sell`
- `/member-portal/marketplace/sell/[productId]`

> Note: `KEEP_MIGRATE_DELETE.md` also lists some legacy **API-style** paths using `:param` placeholders.
> Those are not App Router route directories and will be audited separately.

---

## Top known SSOT gaps (from `SSOT_AUDIT_REPORT.md`)

| Area | Status | Severity | Notes |
| --- | --- | --- | --- |
| Onboarding follow-admin gate end-to-end + tests | 🟡 partial | P0 | SSOT requires mandatory admin follow. |
| Marketplace reviews/ratings + disputes + moderation tooling | 🟡 partial | P1 | Spec requires verified purchaser reviews, dispute/report flows. |
| Referrals: migrations + RLS verification | 🟡 partial | P0/P1 | Must confirm required tables + RLS constraints. |
