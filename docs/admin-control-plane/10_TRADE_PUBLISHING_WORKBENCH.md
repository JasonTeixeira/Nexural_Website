# Admin Control Plane — Trade Publishing Workbench (SSOT)

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This is the Tier‑1 spec for the **Admin publishing system**. If this module is correct, the entire platform becomes reliable.

## Why this matters
Admin publishing is the **truth producer** for:
- Member feed
- Alerts
- Public teaser funnel
- Analytics
- Leaderboards integrity (indirect)

This module must enforce:
- canonical ledger writes
- canonical event emissions
- public teaser privacy constraints
- full auditability

Upstream SSOT:
- `docs/TRADING_LEDGER_SPEC.md`
- `docs/ADMIN_DASHBOARD_V1_SPEC.md`
- `docs/EVENT_TAXONOMY.md`

---

## A) Roles / permissions
- Only `owner` can mutate admin trades.
- `support` and `content` are read-only.

---

## B) Canonical data model

### Authoritative tables
- `trading_positions` (Position)
- `option_legs` (0 legs for stocks, 1–4 legs for options)
- `position_events` (append-only audit spine)

### Canonical events
Required lifecycle events:
- `position.opened`
- `position.closed`

Required integrity events:
- `position.amended` (any economic truth change)

Required operational events:
- `position.partial_closed` (supports per-leg changes)
- `position.stop_set`
- `position.target_set`

Optional (recommended):
- `position.image_added`
- `position.comment_added` (if tied to positions)

### Backfill/import flags
Positions must be flagged:
- `source = manual | import | backfill`
Backfilled positions should be excluded from leaderboard until aged 14 days.

---

## C) Public teaser contract (admin trades)
Public can see admin trades, but must not be able to infer:
- entry price
- size (shares/contracts)
- legs details that expose pricing

Public may show:
- symbol, direction
- opened/closed timestamps
- tags/category
- optional outcome band (win/loss) without exact values

**Implementation requirement:** every public-facing endpoint must use a dedicated “teaser projection” response type.

---

## D) Admin UI surfaces

### 1) `/admin/positions` (Workbench)
**Primary jobs:**
- view open/closed
- filter and search
- find “needs attention”

**Must include:**
- filters: status, symbol, tags, strategy
- saved views (optional v2)
- bulk actions:
  - close (allowed)
  - delete (only if safe policy exists; default: do not delete economic truth)

**Acceptance:**
- list renders quickly
- bulk close emits events per position


### 2) `/admin/positions/new` (Create)
Supports:
- stock OR options
- options: up to 4 legs
- stops/targets
- tags/thesis/notes

**Acceptance:**
- create stock emits `position.opened`
- create 4-leg option emits `position.opened` with leg metadata


### 3) `/admin/positions/[id]` (Detail)
This is the canonical “truth page” for a position.

Must support:
- view full details
- amend
- stop set/update
- targets set/update
- partial close per-leg
- full close
- audit/history tab

**Legacy dependencies to remove:**
- `position_activity`
- `stop_loss_history`
- `position_targets`

**Acceptance:**
- any economic edit creates `position.amended`
- partial close updates remaining sizes and records event payload
- audit tab lists events in chronological order


### 4) `/admin/positions/analytics`
Focus:
- swing/options selling analytics
- exposure/heat
- calendar lifecycle
- charts

**Acceptance:**
- analytics reads from canonical ledger + events
- no day-trade-only assumptions

---

## E) API contracts (admin)

These are representative canonical routes (exact names must match codebase conventions):
- `GET /api/admin/positions`
- `POST /api/admin/positions`
- `PATCH /api/admin/positions/[id]`
- `POST /api/admin/positions/[id]/stop`
- `POST /api/admin/positions/[id]/targets`
- `POST /api/admin/positions/[id]/partial-close`

### Standard response rules
- API returns canonical entity ids.
- API returns event ids emitted (recommended).
- Errors are structured (`code`, `message`, `details`).

### Idempotency rules
- Create position: client-supplied idempotency key recommended.
- Targets/stops: prevent duplicate events if no effective change.
- Partial close: must be idempotent per event (dedupe key).

---

## F) Auditability requirements

For every admin mutation:
- write an event to `position_events`
- record actor id/role
- record a diff summary (economic vs minor)
- record optional “why” note

UI requirements:
- show “amended” badge
- show “partial close” badge
- show “stop/target updated” badges

---

## G) Downstream integration contracts

### Feed
Feed items are derived from `position_events`.

### Alerts
Alerts are derived from `position_events` types:
- opened/closed/stop hit/target hit

### Leaderboards integrity
Events must allow detecting:
- backfills
- suspicious amendments
