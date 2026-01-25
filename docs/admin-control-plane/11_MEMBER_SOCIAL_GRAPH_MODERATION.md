# Admin Control Plane — Members, Social Graph, Moderation

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document defines the admin control plane for:
- member management
- social graph oversight
- moderation and community governance

It assumes Nexural is a social platform for traders/investors.

Upstream SSOT:
- `docs/DOMAIN_MODEL.md` (User/Profile/Follow/Comment/Like)
- `docs/PERMISSIONS_PRIVACY.md`
- `docs/LEADERBOARD_DISCOVERY_SPEC.md` (integrity)

---

## A) Roles / permissions
- `owner`: full access
- `support`: full access to members + moderation actions
- `content`: read-only (optional access to reports)

High-risk actions that should remain `owner`-only (recommended):
- permanent bans
- reversing credits/points

---

## B) Member management (`/admin/members`)

### Primary admin jobs
- search by email/username
- confirm subscription status
- resolve support requests
- view profile completeness + portfolio visibility
- review suspicious activity flags

### Required views
1) Member list
   - filters: status (active/suspended/banned), subscription tier, profile completeness
   - sorting: newest, most active, highest reports

2) Member detail (recommended route: `/admin/members/[id]`)
   - identity: email, created_at
   - profile: username, bio, tags
   - privacy settings: portfolio public/private
   - leaderboard eligibility toggle (separate)
   - social metrics: followers/following counts
   - moderation history
   - (future) AI usage and billing summary

### Required actions
- warn
- suspend (timeboxed)
- ban (owner approval recommended)
- reset security sessions (optional)
- set leaderboard eligibility (owner/support)

### Auditability
All actions must be logged:
- who
- what
- when
- why

---

## C) Social graph governance

### Follow graph
Admin should be able to:
- view who follows whom (for abuse investigations)
- detect follow spam (high follow/unfollow rates)

### Engagement objects
Admin should be able to investigate:
- suspicious comment/like patterns
- harassment
- spam posts

---

## D) Moderation (`/admin/moderation`)

### Moderation objects
Reports can target:
- profile
- post
- comment
- position
- journal entry

### Required queues
1) **Open reports**
   - severity scoring
   - status: open/in_review/resolved/dismissed

2) **Integrity queue** (leaderboard abuse)
   - suspicious amendment patterns
   - backfill policy violations
   - repeated edits after close

3) **Spam queue**
   - rate-limit triggers
   - repeated identical content

### Required actions
- remove content (soft delete)
- warn user
- suspend user
- ban user
- mark report resolved/dismissed

### Enforcement principles
- minimize “hard deletes” for auditability
- preserve evidence for repeat offenders

---

## E) Anti-abuse + rate limiting (admin visibility)
Admin must be able to see:
- rate limit hits by endpoint
- top offending IPs
- suspicious signup clusters

This connects to ops monitoring and should be visible in `/admin/system-monitor` as well.

---

## F) Tech spec (data requirements)

### Minimal DB tables needed (conceptual)
(Exact table names may vary, but the concepts must exist.)
- `members`
- `profiles` or profile columns in `members`
- `follows`
- `reports` (moderation)
- `moderation_actions`

### Integration points
- Leaderboard eligibility and integrity rules
- Privacy policy enforcement
