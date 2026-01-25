# Newsletter Spec (Tier‑1 SSOT)

> Status: **Final (2026-01-25)**
> Tie-breaker: `docs/SSOT_DONE_CHECKLIST.md` + `docs/DECISIONS_LOCKED_2026-01-25.md`

This document defines the newsletter system as a **growth engine**:
- capture
- segmentation
- sequences + campaigns
- analytics
- compliance and deliverability

---

## 1) Goals
1) Capture high-intent prospects.
2) Convert prospects to members.
3) Create a repeat content loop that drives daily/weekly engagement.

---

## 2) Subscriber lifecycle
1) Visitor subscribes (email capture).
2) Subscriber enters sequences (welcome + education).
3) Subscriber receives recurring campaigns (market briefs).
4) Subscriber converts to member signup.
5) Subscriber may remain a subscriber even if not a member.

---

## 3) Capture surfaces
Newsletter capture exists across:
- landing page
- blog posts
- briefs pages
- marketplace pages

Capture must support:
- source attribution (which page/component)
- tag assignment (e.g., “market-brief”)

---

## 4) Segmentation model
Subscribers are segmented by:
- tags (market-brief, options, swing, etc.)
- status (active/unsubscribed)
- member status (is_member yes/no)

---

## 5) Sequences vs campaigns

### 5.1 Sequences
Automated multi-step email flows.
Examples:
- welcome sequence
- education sequence
- “follow admin trades” conversion sequence

### 5.2 Campaigns
One-off or recurring broadcasts.
Examples:
- daily/weekly market brief
- product announcements

---

## 6) Admin workflows
Admin must be able to:
- view subscriber list + growth over time
- create/edit templates
- create/edit campaigns
- schedule campaigns
- trigger campaigns manually
- view analytics (send/open/click/unsub)

---

## 7) Analytics requirements
Track:
- send count
- open rate
- click rate
- unsubscribe rate
- conversions to signup

All analytics should be traceable back to:
- campaign id
- subscriber id
- send id

---

## 8) Deliverability and compliance
Professional defaults:
- Unsubscribe link in every email.
- Do-not-email status honored globally.
- Rate limits to prevent abuse.
- Clear sender identity.

---

## 9) Reliability
Email sending must support:
- idempotency (don’t double-send)
- retries (transient failures)
- logging (send attempts and errors)
- admin visibility into failures

---

## 10) Conversion integration
Sequences should route subscribers into:
- signup
- follow-admin onboarding
- alerts enablement

Newsletter is a core pillar for reaching 1k–25k members.

