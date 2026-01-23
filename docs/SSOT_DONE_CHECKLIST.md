# SSOT “Definition of Done” Checklist

This checklist defines when the SSOT is complete enough to refactor safely without guesswork.

## 1) Product decisions locked
- [ ] Public teaser policy is explicit (admin entry + size hidden; no inference fields)
- [ ] Member portfolio privacy policy is explicit (all public OR all private)
- [ ] Editing policy is explicit (allowed + amendment events + visible history)
- [ ] Backfill/import policy is explicit (flagged; leaderboard aging rule defined)
- [ ] Leaderboard model is explicit (v1 positions-derived P&L + capital-at-risk normalization)
- [ ] Alerts policy is explicit (open/close/stop/target only; anti-spam defaults)
- [ ] Onboarding gate is explicit (follow admin required)
- [ ] Marketplace revenue share is explicit (20%)

## 2) Architecture and domains defined
- [ ] Domains and responsibilities are defined (`ARCHITECTURE.md`)
- [ ] Canonical nouns are defined (`DOMAIN_MODEL.md`)
- [ ] Permissions/privacy are defined (`PERMISSIONS_PRIVACY.md`)
- [ ] Event taxonomy is defined (`EVENT_TAXONOMY.md`)

## 3) Tier‑1 deep specs complete
- [ ] Trading ledger spec complete (`TRADING_LEDGER_SPEC.md`)
- [ ] Feed & alerts spec complete (`FEED_ALERTS_SPEC.md`)
- [ ] Leaderboard & discovery spec complete (`LEADERBOARD_DISCOVERY_SPEC.md`)
- [ ] Referrals & points spec complete (`REFERRALS_POINTS_SPEC.md`)
- [ ] Newsletter spec complete (`NEWSLETTER_SPEC.md`)
- [ ] Marketplace spec complete (`MARKETPLACE_SPEC.md`)

## 4) Cleanup and migration inventory exists
- [ ] Known legacy models documented (`DEPRECATION_DELETE_LIST.md`)
- [ ] Keep/Migrate/Delete inventory documented (`KEEP_MIGRATE_DELETE.md`)
- [ ] Deletion gates are explicit (parity + traffic=0 + tests + rollback)

## 5) Refactor sequencing agreed
- [ ] Phased refactor plan exists (`REFACTOR_PLAN.md`)
- [ ] Phase 1 is “canonical ledger + events” and is agreed as first priority
- [ ] Acceptance criteria exist for each phase

## 6) Operational readiness documented
- [ ] Ops runbook exists (`OPS_RUNBOOK.md`)
- [ ] Data integrity checks are defined
- [ ] Incident response and deployment safety are defined

---

## When we can start deleting code
We can begin **safe deletion** only after:
1) Canonical ledger path is implemented end-to-end for admin + member flows
2) Old endpoints/pages have zero traffic for a defined window
3) Regression tests exist for the canonical path

