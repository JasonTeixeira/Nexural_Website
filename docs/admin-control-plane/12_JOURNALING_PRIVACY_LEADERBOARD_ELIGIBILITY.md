# Admin Control Plane — Journaling, Privacy, Leaderboard Eligibility

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document defines how the platform supports:
- journaling (trade-linked reflection)
- portfolio privacy (public/private)
- leaderboard eligibility (separate toggle)

And what the admin control plane must enforce/govern.

Upstream SSOT:
- `docs/DOMAIN_MODEL.md` (Journal Entry, Portfolio Visibility)
- `docs/TRADING_LEDGER_SPEC.md` (ledger + events)
- `docs/PERMISSIONS_PRIVACY.md`
- `docs/LEADERBOARD_DISCOVERY_SPEC.md`

---

## A) Core user controls

### 1) Portfolio visibility (global)
- **Public**: positions visible to others (subject to additional rules)
- **Private**: positions not visible to others

### 2) Leaderboard eligibility (separate)
- Separate toggle from Public/Private.
- Default recommendation:
  - Public portfolio: can opt into leaderboard
  - Private portfolio: cannot appear on leaderboard

---

## B) Journaling model

### Journal Entry
Journal entries are tied to a position.
They can include:
- thesis
- emotions
- checklist
- screenshots
- playbook tags

### Admin governance
Admin can:
- review reported journal entries
- remove abusive content
- investigate integrity issues (journal edits used to game perception)

---

## C) Integrity constraints (leaderboards)

Eligibility requires (per spec):
1) public portfolio
2) completed profile (bio + tags)
3) minimum activity threshold (tunable)

Backfill policy:
- backfilled/imported positions are excluded from leaderboards for 14 days

Amendment policy:
- amendments after close must display badges
- suspicious amendment patterns trigger moderation review

---

## D) Admin surfaces

### 1) `/admin/journals`
Governance view, not authoring.
Must show:
- reported items
- recent edits
- user context

### 2) `/admin/leaderboards/integrity`
Integrity queue:
- suspicious amendments
- backfill timing violations
- abnormal return% outliers

### 3) `/admin/members/[id]`
Member-level switches:
- portfolio public/private
- leaderboard eligible

---

## E) Tech spec (data requirements)

Conceptually required tables/entities:
- `journal_entries`
- `journal_entry_assets` (screenshots)
- `import_jobs`
- privacy fields on member profile
- leaderboard eligibility flag

Event linking:
- journal entries reference `trading_positions.id`
