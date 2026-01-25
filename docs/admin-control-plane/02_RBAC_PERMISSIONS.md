# Admin Control Plane — RBAC & Permissions

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document defines role-based access control (RBAC) for the Admin Control Plane.

## Roles

### 1) `owner`
Full administrative control.

Allowed:
- trade publishing (create/amend/partial close/close)
- member management actions
- moderation actions
- growth + revenue controls
- AI pricing/keys/credits
- ops + deletion-gate execution

### 2) `support`
Customer support + community governance.

Allowed:
- members (read + support actions)
- moderation (reports queue + enforcement)
- ops (health read, job/webhook read)

Not allowed:
- trade publishing
- AI pricing/keys
- points/credits grants without `owner` approval *(policy choice; default: disallow)*

### 3) `content`
Growth/content operator.

Allowed:
- newsletter campaigns/sequences/templates
- blog/content (future)
- growth analytics read

Not allowed:
- trade publishing
- moderation enforcement (may view reports if needed)
- AI pricing/keys
- deletion-gates execution

---

## Permission matrix (by module)

Legend:
- **R** = read
- **W** = write/mutate
- **A** = approve (high-risk actions)

| Module | Routes (examples) | owner | support | content |
|---|---|---:|---:|---:|
| Home overview | `/admin` | R | R | R |
| Trades (publishing) | `/admin/positions/*` | R/W | R | R |
| Members | `/admin/members*` | R/W | R/W | R |
| Moderation | `/admin/moderation*` | R/W | R/W | R |
| Journaling governance | `/admin/journals*` | R/W | R/W | R |
| Leaderboards admin | `/admin/leaderboards*` | R/W | R | R |
| Newsletter | `/admin/newsletter*` | R/W | R | R/W |
| Referrals/points | `/admin/referrals*` | R/W/A | R | R |
| AI analytics/billing | `/admin/ai*` | R/W/A | R | R |
| Marketplace reports | `/admin/marketplace/reports` | R/W | R/W | R |
| Ops/monitoring | `/admin/system-monitor`, `/admin/health` | R/W | R | R |
| Deletion gates | `/admin/deletion-gates` | R/W/A | R | R |
| Settings | `/admin/settings` | R/W | R | R |

Notes:
- Trade publishing is **owner-only** for write operations.
- “A” actions require explicit confirmation UX + audit trail.

---

## Enforcement requirements

### UI enforcement
- Hide navigation items the role cannot access.
- Block direct URL access with an admin-auth wrapper.

### API enforcement (non-negotiable)
- All `/api/admin/*` must check session + role.
- Never rely on UI-only enforcement.
- High-risk endpoints require:
  - explicit role check
  - audit log entry
  - idempotency where applicable

### Audit logging
Every privileged mutation must record:
- actor (admin user id)
- actor role
- timestamp
- action type
- target entity ids
- before/after snapshot or diff reference

---

## Open questions (to lock during implementation)
1) Do we allow `support` to grant points/credits? Default: **no**.
2) Do we allow `content` to view moderation reports? Default: **read-only**.
