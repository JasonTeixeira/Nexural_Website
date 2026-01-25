# Ops Runbook (SSOT)

This document defines how Nexural should be operated in production.

It is architecture-level and focuses on:
- reliability
- monitoring
- incident response
- safe deployments
- data integrity

---

## 1) Availability goals
Recommended targets:
- Uptime: 99.9%
- RPO/RTO defined (backup + restore expectations)

---

## 2) Critical systems to monitor

### 2.1 Auth and session health
- login/signup success rates
- auth callback errors

### 2.2 Trading ledger
- position create/update/close error rates
- event creation error rates
- amendment event integrity

### 2.3 Feed & alerts
- feed API latency
- notification delivery success rates
- backlog of pending notifications

### 2.4 Leaderboard rollups
- rollup job success rate
- rollup latency
- data drift checks

### 2.5 Newsletter
- send success
- bounce/complaints
- unsubscribe rate spikes

### 2.6 Marketplace
- webhook success
- payout failures
- download entitlement errors

---

## 3) Logging and observability
Requirements:
- structured logging for:
  - API errors
  - webhook failures
  - cron job failures
- centralized error tracking (Sentry)

### 3.2 Redis (Rate limiting + caching)

In production, rate limiting should use Redis (Upstash recommended on Vercel).
Without Redis, the app falls back to in-memory counters per serverless instance,
which is **not reliable** at scale.

Required Vercel env vars (Production + Preview):
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Verification:
1) Deploy after adding env vars.
2) Check Redis health endpoint:
   - `GET https://www.nexural.io/api/health/redis`
   - Expect: `{ ok: true, configured: true, canReadWrite: true }`


### 3.1 Deletion-gate telemetry (SSOT)

We only delete legacy routes/tables after satisfying **all** deletion gates in
`docs/KEEP_MIGRATE_DELETE.md`, including:
- Parity
- **Traffic = 0 for 14 days**
- Tests
- Rollback

To measure “Traffic = 0”, we emit a stable structured log line:

```json
{"type":"DELETION_GATE_HIT","tag":"legacy.api.trading.positions","meta":{"method":"GET"},"ts":"2026-01-19T00:00:00.000Z"}
```

#### How to verify traffic

1) In your log platform, search for:
- `type:"DELETION_GATE_HIT"`

2) Filter by the specific tag you want to delete, e.g.:
- `tag:"legacy.api.trading.positions"`
- `tag:"legacy.table.live_trades"`
- `tag:"legacy.table.swing_positions"`

3) Confirm there have been **zero** hits in the last **14 days**.

4) Only after the 14-day window and at least one regression test exists for the
canonical replacement, you may delete the legacy module/route/table (rollback
must remain a simple git revert).

---

## 4) Incident response

### 4.1 Severity levels
- SEV1: login broken, ledger broken, payments broken
- SEV2: alerts degraded, rollups delayed
- SEV3: UI-only issues

### 4.2 Response steps
1) Confirm scope and blast radius.
2) Disable non-critical pipelines if needed.
3) Restore critical path: auth → ledger → feed.
4) Postmortem and add regression coverage.

---

## 5) Data integrity checks
Scheduled checks:
- orphan legs without positions
- events without valid positions
- leaderboards referencing private users
- backfill flags present for imported data

---

## 6) Deployment safety
Recommended:
- staged deploys
- database migrations with rollback plan
- feature flags for monetization switch

---

## 6.1) Auth / Login verification (post-deploy)

### Quick smoke test (automated)

Run:

```bash
./scripts/smoke-auth.sh https://www.nexural.io
```

This verifies:
- `/api/health/env` is up
- `/auth/login` loads
- `/admin/login` loads
- `/api/public/marketplace/products` loads

### Member login (manual end-to-end)

1. Go to `https://www.nexural.io/auth/login`
2. Test one of:
   - Email/password
   - Google OAuth
   - Discord OAuth
   - GitHub OAuth
   - Microsoft (Azure) OAuth
3. Expected result:
   - You land on `https://www.nexural.io/member-portal/dashboard`

### Admin login (manual end-to-end)

1. Go to `https://www.nexural.io/admin/login`
2. Login with a valid admin account
3. Expected:
   - You land on `/admin`
   - Opening `/admin` in an incognito window redirects back to `/admin/login`

### Reset password

#### Member reset password
1. Go to `https://www.nexural.io/auth/forgot-password`
2. Submit email
3. Confirm the email contains a link and that the reset completes.

#### Admin reset password
1. Go to `https://www.nexural.io/admin/forgot-password`
2. Submit email
3. Confirm reset completes and admin can login again.

### SSOT onboarding gate prerequisites

The onboarding gate uses `ADMIN_USER_ID`.

If onboarding shows: `ADMIN_USER_ID is not configured`, set it in Vercel Production
to the Supabase Auth UUID of the Admin account.

---

## 7) Backup & restore
Must define:
- backup frequency
- retention
- restore drill cadence
