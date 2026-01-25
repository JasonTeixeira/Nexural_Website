# Admin KEEP / MIGRATE / DELETE / BUILD (Evidence-based)

Updated: 2026-01-25

This file maps **admin pages** to their **API calls** and **direct DB tables** (if any).
It then classifies each page as KEEP / MIGRATE / DELETE / BUILD based on SSOT decisions:
- Admin publishes **stocks/options only** (up to 4 legs)
- No futures / IB Gateway / paper trading
- Event spine is authoritative (audit trail)

---

## Pages

### `/admin` — KEEP (MIGRATE)
- Page: `app/admin/page.tsx`
- APIs: `/api/admin/dashboard`
- Notes:
  - API currently reads legacy `position_activity`.
  - Must migrate activity feed → canonical event spine.

### `/admin/positions` — KEEP (MIGRATE)
- Page: `app/admin/positions/page.tsx`
- APIs: `/api/positions/bulk-close`, `/api/positions/bulk-delete`
- Tables: `positions`
- Notes:
  - Must evolve to options legs + partial close support.
  - Bulk close must emit canonical events.

### `/admin/positions/new` — KEEP (MIGRATE)
- Page: `app/admin/positions/new/page.tsx`
- APIs: `/api/discord/position-signals`
- Tables: `positions`
- Notes:
  - Must support 4-leg options + per-leg partial closes (future actions).
  - Must emit canonical events.

### `/admin/positions/[id]` — KEEP (MIGRATE - high priority)
- Page: `app/admin/positions/[id]/page.tsx`
- Tables:
  - `positions`
  - **legacy:** `position_targets`, `stop_loss_history`, `position_activity`
- Notes:
  - Must migrate to event spine and canonical leg model.
  - This page becomes the authoritative audit trail.

### `/admin/positions/analytics` — KEEP (MIGRATE)
- Page: `app/admin/positions/analytics/page.tsx`
- Tables: `positions`
- Notes:
  - Currently includes day-trade/futures-style timeframe concepts.
  - Must refocus to swing + options selling; add calendar + heatmaps.

### `/admin/members` — KEEP (DELETE futures UI)
- Page: `app/admin/members/page.tsx`
- APIs: `/api/admin/members`, `/api/newsletter/subscribers`
- Notes:
  - Contains futures symbols (ES/NQ/YM/RTY/etc) in UI copy → remove.

### `/admin/newsletter` — KEEP
- Page: `app/admin/newsletter/page.tsx`
- APIs: `/api/admin/newsletter/send`
- Tables: `newsletter_subscribers` (direct)

### `/admin/newsletter/campaigns` — KEEP
- Page: `app/admin/newsletter/campaigns/page.tsx`
- APIs: `/api/admin/newsletter/campaigns`, `/api/admin/newsletter/templates`, `/api/admin/newsletter/send`

### `/admin/marketplace/reports` — KEEP
- Page: `app/admin/marketplace/reports/page.tsx`
- APIs: `/api/admin/marketplace/reports`

### `/admin/system-monitor` — KEEP
- Page: `app/admin/system-monitor/page.tsx`
- APIs: `/api/admin/system-monitor?action=health|metrics|errors`

### `/admin/health` — KEEP
- Page: `app/admin/health/page.tsx`
- APIs: `/api/health`

### `/admin/settings` — KEEP (DELETE IB Gateway section)
- Page: `app/admin/settings/page.tsx`
- Notes:
  - Contains IB Gateway config UI and env vars → remove.

### `/admin/signals` — KEEP (compat redirect)
- Page: `app/admin/signals/page.tsx`
- Notes:
  - Compatibility redirect to `/admin/positions`.
  - Remove after deletion-gate window once no traffic.

### `/admin/coupons` — MIGRATE → `/admin/referrals` (rebrand)
- Page: `app/admin/coupons/page.tsx`
- Tables: `coupons`
- Notes:
  - Replace with referrals/points management.
  - Do not build further on coupons.

### `/admin/algo-trading-waitlist` — KEEP (future)
- Page: `app/admin/algo-trading-waitlist/page.tsx`
- APIs: `/api/admin/algo-trading-waitlist` (stub)

### `/admin/analytics` — REVIEW
- Page: `app/admin/analytics/page.tsx`
- Notes:
  - Unclear scope vs `/admin/positions/analytics`.
  - Likely consolidate into positions analytics.

### `/admin/login`, `/admin/forgot-password`, `/admin/reset-password` — KEEP
- Auth flows.

---

## BUILD (missing but required)
- `/admin/referrals`
- `/admin/moderation`
- Future: `/admin/leaderboards`, `/admin/content` (blog + guest authors)
