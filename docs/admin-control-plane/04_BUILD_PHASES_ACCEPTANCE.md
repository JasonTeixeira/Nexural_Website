# Admin Control Plane — Build Phases & Acceptance Criteria

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document is the build execution plan for making the admin dashboard “10M mini‑SaaS ready”.

## Guiding principle
**Stop drift first.** Finish the canonical ledger + event spine and remove legacy drift before adding new surface area.

References:
- `docs/REFACTOR_PLAN.md`
- `docs/SSOT_PHASE_COMPLETION.md`

---

## Phase P0 — Admin as truth producer (SSOT hardening)

### Goal
Admin trade publishing becomes the single source of truth for:
- member feed
- alerts
- analytics
- leaderboards (indirect)

### Scope
1) Trades workbench is fully SSOT:
   - options (up to 4 legs)
   - per-leg partial closes
   - stop/targets
   - full audit timeline

2) Remove legacy drift:
   - migrate/retire `/api/admin/unified-dashboard`
   - migrate/retire `/api/admin/swing-positions`
   - migrate member swing positions UI to canonical ledger

3) RBAC enforcement:
   - owner-only publishing

### Acceptance criteria
- Admin can create/modify/close positions and each action emits canonical events.
- Position detail audit/history is purely event-driven.
- No admin UI reads legacy tables listed as DELETE.
- Deletion gates show legacy endpoints usage trending to 0.

### Tests
- unit: event emission for create/amend/partial close/close/stop/target
- integration: admin dashboard endpoint returns KPIs + activity feed from events

---

## Phase P0 — Growth engine control plane

### Newsletter admin
- sequences + campaigns + send logs + retries
- analytics dashboards

Acceptance:
- campaign send is idempotent
- unsubscribe compliance enforced
- failures visible in admin

### Referrals + points admin
- referral stats
- points ledger view
- fraud signals
- owner-only point adjustments

Acceptance:
- points ledger append-only
- fraud signals visible

---

## Phase P1 — Social + journaling governance

### Moderation
- reports queue (post/comment/position/profile/journal)
- enforcement actions + audit log

### Journaling governance
- journal reports
- content moderation actions

### Leaderboards admin
- eligibility rules enforcement
- integrity review queue
- seasons/competitions scaffolding

Acceptance:
- eligibility rules match `LEADERBOARD_DISCOVERY_SPEC.md`
- backfill aging exclusion enforced

---

## Phase P1 — AI analytics monetization control plane

### AI admin
- usage dashboards
- credits/allowances + credit packs
- quotas + rate limits + kill switch
- provider keys + rotation policy

Acceptance:
- every AI request is metered
- admin can stop abuse
- billing/credits are auditable

---

## Phase P2 — Ops maturity

### System monitor
- background jobs
- webhooks
- error queues
- deletion gates

Acceptance:
- operators can answer “what’s broken” in < 60 seconds

---

## Deletion-gate policy (mandatory)
Legacy code can be deleted only when:
1) parity confirmed
2) tests exist
3) deletion gate counters are 0 for **14 days**
