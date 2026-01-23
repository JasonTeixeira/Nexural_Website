# Deprecation & Deletion List (SSOT)

This document lists **known legacy/duplicate systems** found in the current codebase and how we will safely retire them.

## 1) Why this exists
The repo currently references multiple overlapping trading/position models. This causes:
- inconsistent dashboards
- inconsistent analytics
- unreliable alerts
- difficulty scaling and maintaining the product

The SSOT requires a single canonical trading ledger.

---

## 2) Legacy/duplicate trading models discovered

### 2.1 `live_trades` (legacy)
**Evidence:** referenced by:
- `app/api/trading/positions/route.ts`
- `app/api/trading/performance/route.ts`

**SSOT stance:** deprecated.

**Replacement:** canonical `positions` ledger + events.

**Retirement steps:**
1) Migrate any UI/API consumers to canonical `/api/positions/*`.
2) Confirm no production traffic.
3) Remove `/api/trading/*` routes.
4) Remove `live_trades` usage.

### 2.2 `position_activity` (legacy)
**Evidence:** referenced by:
- `app/api/dev/seed-portfolio/route.ts`
- `app/admin/positions/[id]/page.tsx`

**SSOT stance:** deprecated.

**Replacement:** `position_events` (`position.*`) as canonical audit + activity.

### 2.3 `portfolio_positions` (legacy admin portfolio)
**Evidence:** referenced by:
- `app/api/admin/portfolio/positions/*`

**SSOT stance:** likely redundant.

**Replacement:** canonical `positions` + a portfolio concept defined by ownership.

### 2.4 `swing_positions` (legacy positions feed)
**Evidence:** referenced by:
- `app/api/member/positions/route.ts`
- `app/api/admin/unified-dashboard/route.ts`
- `app/member-portal/swing-positions/page.tsx`

**SSOT stance:** deprecated.

**Replacement:** canonical positions ledger.

---

## 3) Rules for safe deletion
No deletion occurs until:
1) feature parity exists in canonical path
2) telemetry shows zero usage
3) the SSOT docs define the replacement clearly

---

## 4) Additional candidates (to review)
The reality audit indicates high usage of:
- `algo_trading_waitlist`
- other ML/pipeline related tables

These must be evaluated against the PRD scope. If out of scope, archive or delete after traffic confirmation.

