# Permissions & Privacy (SSOT)

> Status: **Final (2026-01-25)**
> Tie-breaker: `docs/SSOT_DONE_CHECKLIST.md` + `docs/DECISIONS_LOCKED_2026-01-25.md`

## 1) Roles
### Public
- Not signed in.

### Member
- Signed in with verified email.

### Admin
- Signed in + admin role.
- RBAC levels (example): owner/support.

## 2) Content access tiers
Nexural has **two primary content tiers**:
- **Public teaser**
- **Member full access**

## 3) Admin trades teaser policy (public)
Public can view admin trade teasers that:
- **Hide entry price**
- **Hide sizing** (shares/contracts)
- Do not expose any derived fields that allow entry/size inference.

Public teaser may include:
- symbol + direction
- open/close timestamps
- tags/high-level thesis category
- outcome banding (optional): win/loss without exact P&L

## 4) Member access (full)
Members can view:
- full admin positions and legs
- full events and notes (as allowed)
- full admin analytics visualizations

## 5) Member portfolio visibility
Members choose **one global mode**:
- **Public**: all positions are visible to other members (and potentially to public discovery pages depending on product decision).
- **Private**: no positions are visible (except to the owner).

**No per-position toggles** in v1.

### 5.1 Transition rules (to remove ambiguity)
When switching **Public → Private**:
- remove the user from leaderboards and discovery immediately
- hide their historical positions from other members immediately
- previously created feed items from that user become hidden to others

When switching **Private → Public**:
- user becomes eligible for discovery/leaderboards only after meeting eligibility requirements
- backfilled/imported positions remain flagged; leaderboard aging rules still apply

## 6) Follow-admin requirement
Onboarding should strongly prompt every new member to follow the Admin account.

Enforcement (product decision locked 2026-01-25):
- **Soft prompt**: follow-admin is recommended but **skip is allowed**.
- Alert subscriptions for “admin trade alerts” may require admin follow.

See: `docs/DECISIONS_LOCKED_2026-01-25.md`

## 7) Editing and audit history
- Positions may be edited.
- Every edit creates an **amended event**.
- Users can view edit history where relevant (member-facing transparency).

## 8) Backfill/import rules
- Backfilled/imported positions are allowed.
- Must be explicitly flagged as backfilled/imported.
- Blueprint must specify whether backfilled positions:
  - are included in leaderboards immediately,
  - or are aged/excluded for trust.

## 9) Safety controls
- Block/mute/report exist as first-class behaviors.
- A blocked user cannot:
  - follow
  - message
  - interact (comment/like) with the blocker.
