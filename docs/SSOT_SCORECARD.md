# SSOT Compliance Scorecard (WIP)

Generated: **TBD (auto-generated)**

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

## SSOT Document Scores (initial placeholder)

> NOTE: These will be filled with evidence links and gaps as we complete the coverage matrix.

| Document | Score | Status | Notes |
| --- | ---:| --- | --- |
| `docs/PRD.md` | TBD | — | |
| `docs/ARCHITECTURE.md` | TBD | — | |
| `docs/DOMAIN_MODEL.md` | TBD | — | |
| `docs/PERMISSIONS_PRIVACY.md` | TBD | — | |
| `docs/EVENT_TAXONOMY.md` | TBD | — | |
| `docs/TRADING_LEDGER_SPEC.md` | TBD | — | |
| `docs/FEED_ALERTS_SPEC.md` | TBD | — | |
| `docs/LEADERBOARD_DISCOVERY_SPEC.md` | TBD | — | |
| `docs/REFERRALS_POINTS_SPEC.md` | TBD | — | |
| `docs/NEWSLETTER_SPEC.md` | TBD | — | |
| `docs/MARKETPLACE_SPEC.md` | TBD | — | |
| `docs/KEEP_MIGRATE_DELETE.md` | TBD | — | |
| `docs/DEPRECATION_DELETE_LIST.md` | TBD | — | |
| `docs/OPS_RUNBOOK.md` | TBD | — | |
| `docs/REFACTOR_PLAN.md` | TBD | — | |

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
