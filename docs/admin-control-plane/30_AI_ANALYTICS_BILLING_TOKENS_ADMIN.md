# Admin Control Plane — AI Analytics + Billing + Credits

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document defines the admin control plane for:
- AI portfolio analytics
- usage metering
- credits/allowances
- credit packs (Stripe)
- safety controls (quotas, kill switches)

## Product intent
AI is an additional revenue stream via a hybrid monetization model:
- monthly included allowance
- additional credit packs

AI features must be:
- useful
- explainable
- safe (no “financial advice” framing)
- scalable and cost-controlled

---

## A) Roles / permissions
- `owner`: full access
- `support`: read-only (usage support)
- `content`: no access

Owner-only actions:
- set pricing
- grant/revoke credits
- rotate provider keys
- disable AI for a user

---

## B) Admin surfaces

### 1) `/admin/ai` (overview)
Must show:
- daily AI requests
- daily credits consumed
- estimated cost vs revenue (margin proxy)
- top users
- abuse alerts

### 2) `/admin/ai/usage`
Drilldown:
- usage by user
- usage by feature type (risk scan, allocation, suggestions)
- time series

### 3) `/admin/ai/pricing`
Config:
- monthly included allowance per tier
- credit pack pricing
- per-request pricing rules (optional)

### 4) `/admin/ai/credits`
Credits ledger:
- immutable credit transactions (grant/burn/adjust)
- per-user balances derived from ledger

### 5) `/admin/ai/keys`
Secrets governance:
- provider key storage
- rotation policy
- last rotated timestamp

---

## C) Metering requirements (non-negotiable)
Every AI request must record:
- user_id
- feature type
- cost units (credits)
- request id (idempotency)
- timestamp
- success/failure

Failures must still be logged, but should not always consume credits (policy decision).

---

## D) Safety controls
- per-user quota
- global rate limiting
- kill switch per user
- kill switch global

---

## E) AI feature set (v1)
Recommended v1 portfolio analytics:
- concentration risk (top holdings)
- sector exposure
- volatility proxy (if price data available)
- drawdown proxy
- diversification score

Optional (v2):
- correlation heatmap
- scenario analysis
- watchlist suggestions

---

## F) Tech spec (data requirements)
Conceptual entities:
- `ai_usage_events`
- `ai_credit_ledger`
- `ai_pricing_config`
- `ai_feature_flags` (per user)

Integration:
- Stripe purchases create credit ledger entries
