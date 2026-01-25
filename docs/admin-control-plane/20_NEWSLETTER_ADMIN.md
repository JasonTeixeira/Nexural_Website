# Admin Control Plane — Newsletter Admin (Growth Engine)

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document defines the admin control plane for the Newsletter system.

Upstream SSOT:
- `docs/NEWSLETTER_SPEC.md`

---

## A) Roles / permissions
- `owner`: full access
- `content`: full access (campaigns/sequences/templates)
- `support`: read-only

High risk actions (owner approval recommended):
- importing large subscriber lists
- changing sender identity/domains

---

## B) Admin surfaces

### 1) `/admin/newsletter` (overview)
Must show:
- subscriber growth (time series)
- segmentation counts
- recent sends performance
- failure queue summary

### 2) `/admin/newsletter/campaigns`
Campaign workflows:
- create/edit
- schedule
- send now
- analytics

### 3) `/admin/newsletter/sequences`
Sequences workflows:
- welcome sequence
- education sequence
- conversion sequence (follow admin trades)

### 4) `/admin/newsletter/sends`
Operational log:
- send attempts
- failures
- retries
- idempotency keys

---

## C) Compliance requirements
- Unsubscribe link in every email
- Do-not-email honored
- suppression list enforcement

---

## D) Reliability requirements
- idempotent send operations
- retries for transient failures
- visibility into provider errors
- rate limiting / batching

---

## E) Tech spec (data requirements)
Conceptual entities:
- newsletter subscribers
- campaigns
- sequences
- sends
- click tracking
- unsubscribe events
