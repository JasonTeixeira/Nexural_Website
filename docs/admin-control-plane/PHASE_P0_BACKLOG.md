# Phase P0 Backlog — Admin as SSOT Truth Producer

Status: **Draft (ready to execute)**  
Updated: 2026-01-25

This backlog is the execution plan for Phase P0, aligned to:
- `docs/admin-control-plane/04_BUILD_PHASES_ACCEPTANCE.md`
- `docs/admin-control-plane/10_TRADE_PUBLISHING_WORKBENCH.md`

## Definition of Done (P0)
- Admin trade publishing is fully SSOT.
- Legacy drift endpoints are retired behind deletion gates.
- RBAC is enforced across `/api/admin/*` with role checks.
- Test suite covers canonical paths.

---

## P0-1: Inventory + freeze legacy drift
### Tasks
- [ ] Confirm all legacy drift endpoints:
  - `/api/admin/unified-dashboard`
  - `/api/admin/swing-positions`
- [ ] Identify all UI callers to these endpoints.
- [ ] Ensure deletion-gate telemetry is emitted for each legacy endpoint + method.

### Acceptance
- We can answer: “who is still calling legacy?”

---

## P0-2: Unify admin auth (RBAC-ready)
### Tasks
- [ ] Standardize admin auth to a single mechanism.
  - Prefer: `admin_session` cookie + `admin_authenticated=true`
  - Or Bearer token with role claims
- [ ] Ensure `verifyAdminToken` is not a stub.
- [ ] Add role checks: `owner`, `support`, `content`.

### Acceptance
- All `/api/admin/*` endpoints reject unauthorized requests.
- Publishing endpoints reject non-owner.

---

## P0-3: Migrate legacy swing-positions → canonical trading ledger
### Tasks
- [ ] Replace `/api/admin/swing-positions` with `/api/admin/positions` for all admin UIs.
- [ ] Ensure the admin workbench uses `trading_positions` + `option_legs` + `position_events`.

### Acceptance
- Admin can publish trades without touching `swing_positions`.
- Events are emitted.

---

## P0-4: Retire `/api/admin/unified-dashboard`
### Tasks
- [ ] Ensure admin home reads from `/api/admin/dashboard` only.
- [ ] Remove IB/paper-trading/legacy modules.

### Acceptance
- Deletion gate counts go to 0.

---

## P0-5: Tests + ops readiness
### Tasks
- [ ] Add integration tests for:
  - create/amend/partial-close/close emits correct events
  - admin dashboard KPIs + activity feed
  - RBAC denies non-owner publishing

### Acceptance
- `npm test` green.
