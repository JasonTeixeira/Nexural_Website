# Refactor Plan (SSOT)

This is an architecture-level plan for how the codebase will be aligned to the SSOT.
No implementation details; focuses on sequencing and risk control.

## Guiding principle
**Stop drift first**: converge to one canonical trading ledger and event spine before adding new features.

## Phase 1 — Converge the canonical trading ledger
Goal: one model powers admin trades, member trades, analytics, feed, alerts.

Work:
- Choose canonical entities from `DOMAIN_MODEL.md`.
- Deprecate competing models (legacy tables/paths) behind a compatibility layer.

Success criteria:
- Admin and member dashboards read from the same canonical ledger.
- Every change emits events.
- Public teaser uses sanitized projections.

Acceptance criteria (explicit):
- Legacy endpoints tagged DELETE in `KEEP_MIGRATE_DELETE.md` have DB-backed deletion-gate counts = 0 for 14 days.
- Legacy admin surfaces (`/api/admin/unified-dashboard`, `/api/admin/swing-positions`) either migrated or proven unused and removed.
- Public teaser projections are enforced in code (no entry/size/targets for admin teaser).

## Phase 2 — Build the daily habit loop (retention)
- Follow-admin onboarding prompt (skip allowed; see `DECISIONS_LOCKED_2026-01-25.md`).
- Alerts that are reliable and non-spammy.
- “Since last visit” feed view.

Acceptance criteria (explicit):
- Onboarding flow matches the soft prompt decision.
- Feed shows admin events by default.
- Alerts only fire for open/close/stop/target.

## Phase 3 — Leaderboards + discovery
- Define performance rollups.
- Implement anti-cheat/backfill rules.
- Add discovery filters and seasonal competitions.

## Phase 4 — Journaling depth + CSV import
- Journal prompts + screenshots.
- CSV import templates.

## Phase 5 — Marketplace polish (secondary)
- Trust signals (reviews, seller reputation).
- Robust license/download pipeline.

## Deletion strategy (safe cleanup)
To safely delete legacy code:
1) Identify legacy modules.
2) Migrate callers to canonical domain APIs.
3) Delete only after:
   - feature parity confirmed,
   - telemetry confirms zero usage,
   - tests cover the canonical path.

Telemetry definition:
- Prefer DB-backed deletion gates: `GET /api/admin/deletion-gates?days=14`

