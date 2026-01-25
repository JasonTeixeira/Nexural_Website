# Event Taxonomy (SSOT)

> Status: **Final (2026-01-25)**
> Tie-breaker: `docs/SSOT_DONE_CHECKLIST.md` + `docs/DECISIONS_LOCKED_2026-01-25.md`

Events are the platform spine. They power:
- feeds
- alerts/notifications
- audit/history
- analytics rollups

## 1) Event principles
- Events are **append-only**.
- Events are **idempotent** (replays should not duplicate outcomes).
- Events are authored by either:
  - Admin
  - Member
  - System (scheduled jobs)

## 2) Canonical position event types
### Lifecycle
- `position.opened`
- `position.closed`

### Risk/plan
- `position.stop_set`
- `position.target_set`

### Risk execution (optional but recommended)
- `position.stop_hit`
- `position.target_hit`

### Amendments (edit history)
- `position.amended`
  - includes: what changed, when, by whom, and why.

Amendment classification:
- **economic**: changes that impact P&L or capital-at-risk
- **non_economic**: thesis/tags/notes formatting

### Media
- `position.image_added`

### Social interactions
- `position.comment_added`
- `position.comment_liked`

### Journal
- `journal.entry_added`
- `journal.entry_amended`

## 3) Feed eligibility rules
A position event is eligible to appear in feeds if:
- it is from Admin, OR
- it is from a Member with **public portfolio**, AND
- it is visible to the viewer (permission rules).

## 4) Notification triggers (v1)
Trigger alerts for:
- `position.opened`
- `position.closed`
- `position.stop_hit` (if modeled)
- `position.target_hit` (if modeled)

Other events can appear in feeds without triggering alerts.

## 5) Audit log requirements
For any event that changes economic truth (entry/exit/legs/size/price):
- emit `position.amended`
- show it in history UI

## 6) Backfill/import requirements
- Backfilled/imported positions must emit:
  - `position.opened` with `source=import|backfill`
- Subsequent corrections emit `position.amended`.

## 7) Points / Referrals

### Points ledger event types

SSOT: points are recorded as an immutable ledger. We classify entries as:
- **earn**: increases points balance
- **burn**: decreases points balance
- **adjustment**: admin/manual corrections (positive or negative)

Implementation mapping (current):
- `referral_signup_verified` => **earn** (referral verified signup)
