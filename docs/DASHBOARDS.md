# Dashboards (SSOT)

This document defines the **Admin Dashboard** and **Member Dashboard** at an architectural level:
- what each dashboard is responsible for
- what information it must show
- how it interacts with the canonical domains

---

## 1) Admin Dashboard

### 1.1 Purpose
The Admin Dashboard is the operational control plane for:
- publishing admin trades (stocks + options up to 4 legs)
- managing content and growth (newsletter, blog)
- governing the community (moderation)
- monitoring platform health

### 1.2 Admin capabilities
#### A) Trade publishing (Tier‑1)
- Create positions (stock/option)
- Add up to 4 legs for options
- Add thesis/notes/tags
- Set stops/targets
- Close positions
- Amend positions (all amendments create edit history events)
- Upload images/proof

**Outputs:** emits canonical `position.*` events.

#### B) Admin trade analytics (Tier‑1)
- View performance over time (P&L-based v1)
- View per-strategy/per-tag rollups

#### C) Growth management
- Newsletter subscribers, campaigns, sequences
- Newsletter analytics

#### D) Community governance
- Review reports
- Ban/suspend actions
- Investigate suspicious leaderboard manipulation

#### E) Operations
- health checks
- background job status
- webhook status

### 1.3 Admin-to-member contract
Admin trade actions must result in:
- immediate member feed updates
- reliable alerts for followers
- public teaser updates (sanitized)

---

## 2) Member Dashboard

### 2.1 Purpose
The Member Dashboard is the daily home for members to:
- follow admin trades
- follow traders
- track their own performance
- optionally participate publicly (portfolio + leaderboard)
- receive alerts and engage socially

### 2.2 Mandatory onboarding rule
On first signup, the member lands on the dashboard.
The dashboard enforces onboarding:
- **Follow Admin is mandatory**
- Enable alerts is strongly encouraged (default off or on — to be decided)
- Complete profile prompts (bio + tags)

### 2.3 Member dashboard sections
#### A) Admin trades module (Tier‑1)
- Snapshot of admin open positions
- Latest admin events
- CTA: “View full trades”

#### B) Following module
- Recent activity from followed traders
- CTA: discover traders

#### C) Personal performance module (Tier‑1)
- performance summary (30/60/90)
- open risk summary
- journaling prompts

#### D) Notifications module (Tier‑1)
- latest alerts
- preferences link

#### E) Growth module
- referral code
- points progress

---

## 3) Key dashboard interactions

### 3.1 Follow Admin
Creates a follow relationship and enrolls the member into admin trade alert subscriptions.

### 3.2 Log a trade
Creates a canonical position + optional legs and emits `position.opened`.

### 3.3 Close a trade
Emits `position.closed`.

### 3.4 Edit a trade
Emits `position.amended` and shows edit history.

### 3.5 Toggle portfolio public/private
If Public:
- member becomes eligible for discovery and leaderboard.
If Private:
- member is removed from discovery and leaderboard.

