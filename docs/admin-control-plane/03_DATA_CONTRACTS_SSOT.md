# Admin Control Plane — SSOT Data Contracts

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document defines the **single source of truth contracts** for admin modules.

## Purpose
Prevent drift by making every admin surface answer:
1) What tables are authoritative?
2) What API routes are canonical?
3) What events are emitted?
4) What projections/constraints must be enforced?

## Canonical domains (upstream)
See:
- `docs/DOMAIN_MODEL.md`
- `docs/TRADING_LEDGER_SPEC.md`
- `docs/EVENT_TAXONOMY.md`
- `docs/PERMISSIONS_PRIVACY.md`

---

## A) Trade publishing (admin positions)

### Admin UI routes
- `/admin/positions`
- `/admin/positions/new`
- `/admin/positions/[id]`
- `/admin/positions/analytics`

### Authoritative tables (SSOT)
- `trading_positions` (Position)
- `option_legs` (Position Leg)
- `position_events` (Position Event / audit spine)

### Canonical API routes
- `GET /api/admin/positions` (list)
- `POST /api/admin/positions` (create)
- `PATCH /api/admin/positions/[id]` (amend)
- `POST /api/admin/positions/[id]/partial-close`
- `POST /api/admin/positions/[id]/stop`
- `POST /api/admin/positions/[id]/targets`

### Required event emissions
Every mutation MUST emit one of:
- `position.opened`
- `position.amended`
- `position.partial_closed`
- `position.closed`
- `position.stop_set`
- `position.target_set`

### Constraints
- Options: max **4 legs**.
- Public teaser rules for admin trades must be enforced (see Trading Ledger spec).

---

## B) Admin dashboard home (/admin)

### Canonical API route
- `GET /api/admin/dashboard`

### KPI sources
KPI calculations must read from canonical sources:
- positions KPIs: `trading_positions` + `position_events`
- member KPIs: `members` + profile completeness fields
- growth KPIs: newsletter + referrals tables (to be enumerated in their specs)

### Activity feed
- Must be derived from `position_events` (not legacy `position_activity`).

---

## C) Members

### Admin UI routes
- `/admin/members`

### Authoritative tables
- `members` (canonical member record)
- profile fields (as stored/represented in DB)
- social graph tables (e.g. `follows`)

### Canonical API routes
- `GET /api/admin/members` (list/search)
- `PATCH /api/admin/members/[id]` (support actions)

### Constraints
- Must respect privacy policies from `docs/PERMISSIONS_PRIVACY.md`.
- Admin actions must be audited.

---

## D) Feed + Notifications

### Authoritative tables
- feed items are derived from events; source tables include:
  - `position_events`
  - social posts/comments (when implemented)
- notifications table:
  - `user_notifications` (in-app inbox)

### Canonical job/cron routes
- `POST /api/cron/ssot-alerts` (fanout)

### Constraints
- Alerts are only fired for allowed event types.
- Idempotency required (dedupe keys) — if DB schema lacks metadata/dedupe, implement a safe substitute.

---

## E) Leaderboards + Discovery

### Authoritative tables
- rollups tables (see leaderboard migrations/spec)
- positions-derived performance inputs

### Canonical API routes
- member-facing:
  - `GET /api/member/leaderboard`
  - `GET /api/member/discovery`
- admin-facing:
  - `/admin/leaderboards/*` (to be implemented)

### Constraints
- Eligibility rules from `docs/LEADERBOARD_DISCOVERY_SPEC.md`.
- Backfill/exclusion aging policy (14 days) enforced.
- Amendments after close must flag integrity warnings.

---

## F) Newsletter (Growth)

### Canonical concept
Newsletter system must support:
- capture
- segmentation
- sequences
- campaigns
- analytics
- deliverability/compliance

### Constraints
See `docs/NEWSLETTER_SPEC.md`.

---

## G) Referrals + Points

### Canonical concept
Points are an **immutable ledger**.

### Constraints
See `docs/REFERRALS_POINTS_SPEC.md`.

---

## H) AI analytics + billing + credits

### Canonical concept
AI requests must be:
- attributed to a user
- metered (credits consumed)
- rate limited
- auditable

### Monetization
Hybrid:
- monthly allowance
- credit packs

### Admin controls
- per-user quota override
- kill switch
- pricing config

---

## Legacy cleanup contracts
Legacy admin surfaces must be migrated or retired:
- `/api/admin/unified-dashboard`
- `/api/admin/swing-positions`

Deletion must be controlled by:
- deletion gates (DB-backed)
- tests + parity confirmation
