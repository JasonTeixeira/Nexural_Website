# Admin Control Plane — Ops Runbook (Admin)

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This runbook defines operational procedures for running Nexural as a production-grade business.

It is intentionally practical.

Upstream references:
- `docs/OPS_RUNBOOK.md`
- `docs/REFACTOR_PLAN.md` (deletion gates)

---

## 1) Core operating principle
When something breaks, the admin dashboard must answer in < 60 seconds:
1) What is broken?
2) How severe is it?
3) What do we do next?

---

## 2) Health checks

### 2.1 Admin health page
- Route: `/admin/health`
- Must show:
  - DB connectivity
  - Auth service
  - email provider health
  - cron/job status

### 2.2 API health
- Provide a simple endpoint used by uptime monitors.

---

## 3) Jobs / Cron operations

### 3.1 Critical jobs
- SSOT alerts fanout (positions → notifications)
- leaderboard rollups
- referral awards

### 3.2 Job requirements
- idempotency
- retry policy
- failure logging
- operator visibility

### 3.3 Operator actions
- rerun job (owner only)
- clear stuck locks (owner only)

---

## 4) Webhook operations

### 4.1 Stripe webhooks
- monitor failures
- replay (if supported)
- verify signature errors

---

## 5) Incident response

### Severity levels
- SEV0: revenue/security outage
- SEV1: core trading/feed outage
- SEV2: degraded performance
- SEV3: minor bug

### SEV0 checklist
1) Stop the bleeding (disable feature flag / kill switch)
2) Identify root cause
3) Communicate status
4) Fix + deploy
5) Postmortem

---

## 6) Deletion gates (safe cleanup)

### Policy
Legacy code can be deleted only when:
1) parity confirmed
2) tests exist
3) deletion gate counters are 0 for 14 days

### Operator workflow
1) Check `/admin/deletion-gates`
2) Identify legacy endpoints still receiving traffic
3) Migrate callers
4) Re-check counters weekly

---

## 7) Security ops
- RBAC audits
- session revocation
- key rotation policy

---

## 8) AI ops
- monitor abuse
- monitor cost spikes
- rotate provider keys
- kill switch per user
