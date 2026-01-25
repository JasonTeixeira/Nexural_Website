# SSOT “Definition of Done” Checklist

This checklist defines when the SSOT is complete enough to refactor safely without guesswork.

## 1) Product decisions locked
- [x] Public teaser policy is explicit (admin entry + size hidden; no inference fields)
- [x] Member portfolio privacy policy is explicit (all public OR all private)
- [x] Editing policy is explicit (allowed + amendment events + visible history)
- [x] Backfill/import policy is explicit (flagged; leaderboard aging rule defined)
- [x] Leaderboard model is explicit (v1 positions-derived P&L + capital-at-risk normalization)
- [x] Alerts policy is explicit (open/close/stop/target only; anti-spam defaults)
- [x] Onboarding gate is explicit (follow admin required)
- [x] Marketplace revenue share is explicit (20%)

See: `docs/DECISIONS_LOCKED_2026-01-25.md`

## 2) Architecture and domains defined
- [x] Domains and responsibilities are defined (`ARCHITECTURE.md`)
- [x] Canonical nouns are defined (`DOMAIN_MODEL.md`)
- [x] Permissions/privacy are defined (`PERMISSIONS_PRIVACY.md`)
- [x] Event taxonomy is defined (`EVENT_TAXONOMY.md`)

## 3) Tier‑1 deep specs complete
- [x] Trading ledger spec complete (`TRADING_LEDGER_SPEC.md`)
- [x] Feed & alerts spec complete (`FEED_ALERTS_SPEC.md`)
- [x] Leaderboard & discovery spec complete (`LEADERBOARD_DISCOVERY_SPEC.md`)
- [x] Referrals & points spec complete (`REFERRALS_POINTS_SPEC.md`)
- [x] Newsletter spec complete (`NEWSLETTER_SPEC.md`)
- [x] Marketplace spec complete (`MARKETPLACE_SPEC.md`)

## 4) Cleanup and migration inventory exists
- [x] Known legacy models documented (`DEPRECATION_DELETE_LIST.md`)
- [x] Keep/Migrate/Delete inventory documented (`KEEP_MIGRATE_DELETE.md`)
- [x] Deletion gates are explicit (parity + traffic=0 + tests + rollback)

## 5) Refactor sequencing agreed
- [x] Phased refactor plan exists (`REFACTOR_PLAN.md`)
- [x] Phase 1 is “canonical ledger + events” and is agreed as first priority
- [x] Acceptance criteria exist for each phase

## 6) Operational readiness documented
- [x] Ops runbook exists (`OPS_RUNBOOK.md`)
- [x] Data integrity checks are defined
- [x] Incident response and deployment safety are defined

---

## When we can start deleting code
We can begin **safe deletion** only after:
1) Canonical ledger path is implemented end-to-end for admin + member flows
2) Old endpoints/pages have zero traffic for a defined window
3) Regression tests exist for the canonical path

