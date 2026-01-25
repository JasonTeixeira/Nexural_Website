# Admin Dashboard v1 Spec (SSOT)

Status: **Draft (ready for implementation)**
Updated: 2026-01-25

This document defines the **Admin Control Plane** for Nexural.

## Product scope (locked)
- **No futures**, no IB gateway, no paper trading.
- Admin publishes **stocks + options** (up to **4 legs**).
- **Partial closes** are required, including **per-leg** partial closes.
- All actions are recorded as **append-only events**.
- Public `/positions` is a **teaser** funnel to drive signups; members see full detail.
- Comments/likes on positions are **members-only**.

## Primary goal
The admin dashboard is the “truth producer” for the entire platform.
If admin publishing is correct, member dashboard/feed, alerts, leaderboards, and analytics become reliable.

---

## Information Architecture (sidebar)
Sidebar default: **collapsed icon-only**.

Modules:
1) **Home** (`/admin`) — control plane overview
2) **Positions** (`/admin/positions`, `/admin/positions/new`, `/admin/positions/[id]`)
3) **Analytics** (`/admin/positions/analytics`) — portfolio analytics + calendar + heatmaps
4) **Members** (`/admin/members`)
5) **Growth**
   - Newsletter (`/admin/newsletter`, `/admin/newsletter/campaigns`)
   - Referrals (BUILD: `/admin/referrals`)
6) **Community / Moderation** (BUILD: `/admin/moderation`)
7) **Leaderboards** (future admin ops surface)
8) **Content (Blog)** (future admin CMS + guest authors)
9) **Marketplace** (`/admin/marketplace/reports`)
10) **Ops** (`/admin/system-monitor`, `/admin/health`)
11) **Settings** (`/admin/settings`)

---

## Canonical event model (admin publishing)
Required events:
- `position.opened`
- `position.amended` (any edit)
- `position.partial_closed` (supports per-leg partial closes)
- `position.closed`
- `position.stop_set`
- `position.target_set`

Audit visibility requirements:
- Always show “amended”/“partial close” badges in relevant UIs.
- A full **Audit/History tab** exists on each position.

---

## Page specs

### `/admin` (Home)
Purpose: answer three questions instantly:
1) Is the business healthy?
2) What needs attention now?
3) What should I do next?

Must show:
- KPI cards: open positions, exposure/heat, 7d P&L, win rate, active members, newsletter growth
- Action center queues:
  - positions requiring action (targets hit / stop updates / partial close)
  - failed jobs/webhooks
  - flagged/suspicious activity
- Live activity feed (event-driven)

Data sources (current):
- `/api/admin/dashboard`
- Tables: `positions`, `members`, **legacy** `position_activity` (must migrate to events)

Acceptance tests:
- loads without auth errors
- KPIs reflect DB state
- activity feed shows last 20 canonical events

### `/admin/positions` (Workbench)
Purpose: daily publishing work.

Must support:
- filters: status, symbol, tags, strategy
- bulk actions (close/delete as allowed)
- quick links: New, Analytics

Data sources:
- currently direct Supabase `positions`
- bulk actions via `/api/positions/bulk-close`, `/api/positions/bulk-delete`

Acceptance tests:
- list renders
- filters work
- bulk close creates events

### `/admin/positions/new`
Purpose: create admin position.

Must support:
- stock or option
- up to 4 legs
- stops/targets
- tags/notes

Acceptance tests:
- create stock position emits `position.opened`
- create 4-leg option position emits `position.opened` with leg metadata

### `/admin/positions/[id]`
Purpose: the source of truth UI for each position.

Must support:
- view full details
- amend (creates `position.amended`)
- partial close per-leg (creates `position.partial_closed`)
- full close (creates `position.closed`)
- show audit timeline (events)

Current legacy dependencies to remove:
- `position_activity`
- `stop_loss_history`
- `position_targets`

Acceptance tests:
- amendments appear in audit tab
- partial close updates remaining size and records per-leg change

### `/admin/positions/analytics`
Purpose: professional portfolio analytics.

Must include:
- time-series charts
- risk/heat
- calendar view (position lifecycle)
- heatmaps

Current issue:
- contains “day trade” timeframe concept; must be refocused to swing/options selling.

---

## KEEP / MIGRATE / DELETE / BUILD (initial)

KEEP (core):
- `/admin`, `/admin/positions/*`, `/admin/members`, `/admin/newsletter/*`, `/admin/marketplace/reports`, `/admin/system-monitor`, `/admin/health`, `/admin/settings`

MIGRATE (data model cleanup):
- `/admin` activity feed off `position_activity` → event spine
- `/admin/positions/[id]` off legacy tables → event spine

DELETE (legacy):
- anything futures/IB gateway/paper trading

BUILD (missing but required):
- `/admin/moderation`
- `/admin/referrals`
