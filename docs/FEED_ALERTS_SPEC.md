# Feed & Alerts Spec (Tier‑1 SSOT)

> Status: **Final (2026-01-25)**
> Tie-breaker: `docs/SSOT_DONE_CHECKLIST.md` + `docs/DECISIONS_LOCKED_2026-01-25.md`

This document defines the **member daily loop**:
- feed generation
- notifications (alerts)
- anti-spam rules
- reliability guarantees

It is built on the event spine from `EVENT_TAXONOMY.md`.

---

## 1) Feed types

### 1.1 Home Feed (default)
Member sees a unified feed composed of:
- Admin trade events
- Events from followed members (if those members are public)
- Optional: platform announcements

### 1.2 Following Feed
Member sees **only** events from followed accounts (admin + followed traders).

### 1.3 “Since last visit” feed
Member sees events since their last seen timestamp.

---

## 2) Feed item sources
Feed items are derived from:
- `position.*` events (opened, closed, amended, etc.)
- comments/likes (optional feed inclusion)
- social posts (optional)

**Tier‑1 feed items (must exist):**
- admin position opened
- admin position closed
- followed member position opened (if public)
- followed member position closed (if public)

---

## 3) Visibility rules
A feed item is visible to a viewer if:
- viewer is a member, AND
- item is from admin OR from a public member portfolio, AND
- viewer is not blocked by the author (safety rule).

Public visitors do not get the full feed; they get teaser pages only.

---

## 4) Feed ordering and ranking (v1)
Professional and predictable.

### 4.1 Default ordering
- Reverse chronological by event timestamp.

### 4.2 Optional prioritization (recommended)
Within the same window:
- Admin events have a slight priority boost.
- Position open/close events rank above comments/likes.

### 4.3 Pagination
- Cursor-based pagination.

---

## 5) Notifications (alerts)

### 5.1 Notification channels
v1 required:
- In-app notifications

v1 optional but recommended:
- Email notifications (digest and/or immediate for admin)

Future:
- push notifications

### 5.2 Alert subscriptions
Members can subscribe to alerts for:
- Admin account (mandatory follow)
- Followed members

### 5.3 Alert trigger rules (v1 default)
Trigger an alert for:
- `position.opened`
- `position.closed`
- `position.stop_hit` (if modeled)
- `position.target_hit` (if modeled)

Do **not** trigger alerts for:
- comments
- likes
- minor edits (non_economic amendments)

Trigger alerts for amendments only if:
- amendment is **economic** AND
- position is owned by Admin AND
- member has opted into “admin amendment alerts” (default OFF)

### 5.4 Alert payload
Alerts must include:
- who (admin/member)
- what happened (opened/closed)
- what symbol
- timestamp
- deep link to the position

For admin alerts:
- teaser restrictions do not apply to members.

---

## 6) Anti-spam policy
The system must remain valuable and not noisy.

### 6.1 Rate limits
- Limit alerts per followed user per day (configurable).
- Batch multiple events into digest if needed.

### 6.2 Default preferences
- Admin alerts: ON recommendation (member can opt out).
- Member alerts: OFF by default (member opts in for specific followed traders).

---

## 7) Reliability guarantees
Alerts must be reliable at 25k members.

### 7.1 Idempotency
- Each event should generate at most one notification per recipient.

### 7.2 Retry policy
- Notification delivery must support retries.
- Failures should be logged and visible in admin ops.

### 7.3 Degraded mode
If a downstream dependency fails (email provider, webhook),
- in-app notifications remain functional.
- system records pending retry.

---

## 8) Onboarding requirement (follow admin)
Onboarding success is defined as:
1) Member is strongly prompted to follow admin (skip allowed).
2) Member sees admin events in their feed.
3) Member receives at least one admin alert (in-app) successfully (if opted in).

See: `docs/DECISIONS_LOCKED_2026-01-25.md`
