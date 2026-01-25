# Locked product decisions (SSOT)

Date: **2026-01-25**

These decisions are now the SSOT and should only change via explicit PR + migration/event versioning.

## 1) Public teaser policy (admin positions teaser)
**Decision:** Teaser shows **only**:
- ticker
- direction
- status
- opened/closed timestamps

Teaser must **not** show:
- entry price
- size
- stop/targets
- any fields that allow size inference

Rationale: prevent reverse-engineering of sizing and preserve premium value.

## 2) Member portfolio visibility model
**Decision:** Member portfolios are **public by default** with opt-out.

Implementation expectation:
- global visibility mode enforced consistently in profile/portfolio/leaderboard/discovery.

## 3) Editing policy
**Decision:** Editing is allowed only via **amendment events** (append-only).

Requirements:
- emit `position.amended`
- store amendment details in event metadata
- show visible history (no silent overwrites)

## 4) Backfill/import policy
**Decision:** Backfill/import is allowed but must be **flagged**.

Requirements:
- `is_backfilled=true` (or equivalent)
- leaderboard rules may exclude/backfill-age per spec

## 5) Leaderboard model (v1)
**Decision:** Positions-derived P&L with **capital-at-risk normalization**.

## 6) Alerts policy (anti-spam)
**Decision:** Alerts are generated only for:
- open
- close
- stop
- target hit

## 7) Onboarding gate
**Decision:** Follow-admin is a **soft prompt** (skip allowed).

Note: This is a product decision; implementation should match.

## 8) Marketplace revenue share
**Decision:** Platform revenue share is **20%**.
