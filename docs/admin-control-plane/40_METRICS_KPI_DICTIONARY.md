# Admin Control Plane — Metrics & KPI Dictionary

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document defines the **canonical KPI dictionary**.

## Why this exists
For a $10M+/yr business, the admin dashboard must not show “random numbers”.
Every KPI must be:
- well-defined
- reproducible from SSOT sources
- consistent across admin + member dashboards

---

## Global definitions

### Time windows
- 24h / 7d / 30d / 60d / 90d are computed in UTC.
- “Active” metrics always specify window and event source.

### SSOT sources
- Trading: `trading_positions`, `option_legs`, `position_events`
- Members: `members` (+ profile fields)
- Growth: newsletter + referrals tables
- Leaderboards: rollups tables
- AI: ai usage + credit ledger

---

## A) Trading KPIs (Admin control plane)

### 1) Open Positions
Definition: count of positions where `status = open` and `owner_type = admin`.

### 2) Closed Positions (7d)
Definition: count of admin positions closed in the last 7 days.

### 3) Win Rate (rolling)
Definition: closed positions where realized P&L > 0 divided by total closed positions in window.
Notes:
- must define the P&L computation per `TRADING_LEDGER_SPEC.md`.

### 4) 7d P&L
Definition: sum of realized P&L for admin positions closed in the last 7 days.

### 5) Exposure / Heat
Definition: measure of capital-at-risk proxy aggregated across open admin positions.
Stocks proxy: `abs(entry_price * shares)`
Options proxy: `abs(entry_premium * contracts * multiplier)` aggregated per leg

---

## B) Member KPIs

### 1) Active Members (30d)
Definition: members who performed at least one meaningful action in the last 30d.
Meaningful action (v1):
- opened a position
- commented
- followed/unfollowed
- created a journal entry
- used AI analysis

### 2) Profile Completion Rate
Definition: percent of members with bio + tags + username.

### 3) Public Portfolio Rate
Definition: percent of members with portfolio visibility = public.

### 4) Leaderboard Eligible Rate
Definition: percent of public members who opted into leaderboard eligibility.

---

## C) Growth KPIs

### 1) Newsletter Subscribers (total)
Definition: count of active subscribers.

### 2) Newsletter Growth (7d)
Definition: new subscribers created in last 7 days.

### 3) Campaign Open Rate
Definition: opens / sends.

### 4) Campaign Click Rate
Definition: clicks / sends.

### 5) Referral Signups (30d)
Definition: verified signups attributed to referral codes.

### 6) Points Issued (30d)
Definition: sum of points ledger “earn” entries in window.

---

## D) Moderation / Safety KPIs

### 1) Open Reports
Definition: reports with status open/in_review.

### 2) Median Time to Resolution
Definition: median (resolved_at - created_at) for reports resolved in window.

### 3) Suspicious Integrity Flags (7d)
Definition: count of integrity flags created in last 7 days.

---

## E) AI Monetization KPIs

### 1) AI Requests (24h)
Definition: count of AI usage events in last 24h.

### 2) Credits Consumed (24h)
Definition: sum of credits burned in last 24h.

### 3) Revenue from Credit Packs (30d)
Definition: sum of Stripe credit-pack purchase revenue in last 30d.

### 4) Estimated AI Cost (30d)
Definition: computed from provider pricing * usage (approx). Must state pricing source.

### 5) Estimated AI Margin (30d)
Definition: (credit pack revenue - estimated cost) / revenue.

---

## KPI governance rule
Any new KPI must be added here with:
- definition
- window
- source tables
- edge cases
