# Admin Control Plane — Leaderboards & Competitions Admin

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document defines the admin control plane for leaderboards, discovery, and competitions.

Upstream SSOT:
- `docs/LEADERBOARD_DISCOVERY_SPEC.md`
- `docs/TRADING_LEDGER_SPEC.md`
- `docs/PERMISSIONS_PRIVACY.md`

---

## A) Admin goals
- Ensure leaderboards are:
  - fair
  - scalable
  - resistant to gaming
- Provide operators tooling to:
  - manage seasons/competitions
  - enforce eligibility
  - investigate integrity issues

---

## B) Admin surfaces

### 1) `/admin/leaderboards` (overview)
Must show:
- active timeframe leaderboards (30/60/90)
- top performers
- growth metrics (eligible users, public portfolios)
- integrity alerts

### 2) `/admin/leaderboards/seasons`
Competition management:
- create season
- configure timeframe + rules
- start/end dates
- prizes (future)

### 3) `/admin/leaderboards/integrity`
Integrity queue:
- repeated amendments after close
- abnormal return% outliers
- backfill policy violations

Actions:
- mark reviewed
- mark suspicious
- remove eligibility
- suspend user (via moderation)

---

## C) Eligibility enforcement
Eligibility requirements (v1):
1) public portfolio
2) completed profile (bio + tags)
3) minimum activity threshold

Admin controls:
- override eligibility (with audit log)
- enforce minimum thresholds

---

## D) Computation / scale contract
Leaderboards are computed via rollups.
Admin should see:
- last rollup time
- job success/failure
- ability to backfill/recompute (owner-only)

---

## E) Integrity rules

### Backfill aging policy
- exclude backfilled positions for 14 days

### Amendment patterns
- show “amended” badges
- flag suspicious edits

---

## F) Tech spec
Conceptual required tables:
- leaderboard rollups tables
- eligibility flags
- integrity flags/audit logs
