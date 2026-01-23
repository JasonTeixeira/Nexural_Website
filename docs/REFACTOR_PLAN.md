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

## Phase 2 — Build the daily habit loop (retention)
- Mandatory follow-admin onboarding gate.
- Alerts that are reliable and non-spammy.
- “Since last visit” feed view.

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

