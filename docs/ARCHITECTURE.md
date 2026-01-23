# Architecture — Nexural Trading (SSOT)

## 1) Architectural intent
Nexural is a **single platform** with a clear separation of concerns:
- **Public web** for discovery (SEO + teaser content).
- **Member experience** for daily utility (alerts, dashboards, community).
- **Admin operations** for publishing and governance.

The architecture must enforce:
1) **One canonical trading ledger** (positions + legs + events).
2) **Event-driven product spine** (events power feed, alerts, audits, and leaderboard rollups).
3) **Explicit permission tiers** (public teaser vs member-only depth).

## 2) Domains (bounded contexts)
The system is organized into these domains. Each domain owns its data, APIs, and UI.

1) **Identity & Profiles**
   - auth, profile, settings
   - privacy (public vs private portfolio)
   - admin RBAC

2) **Trading Ledger (Core)**
   - positions (stocks + options)
   - options legs (up to 4)
   - events (open/close/amend/etc.)
   - journaling attached to positions

3) **Social Graph & Engagement (Core)**
   - follows
   - comments + likes
   - DMs (1:1)

4) **Feed & Notifications (Core)**
   - unified feed
   - notifications and alert subscriptions
   - email digests (optional)

5) **Leaderboards & Discovery (Core)**
   - performance rollups
   - discovery filters
   - seasonal competitions/badges

6) **Growth Engine (Core)**
   - newsletter capture + sequences
   - referrals + points
   - onboarding checklists

7) **Marketplace (Secondary)**
   - sellers/products/licenses
   - revenue share and payouts

8) **Content/SEO (Core)**
   - blog (long-form)
   - briefs/newsletter archive (short-form)

## 3) Permission tiers
Nexural uses two primary tiers for content:
- **Public**: teaser/preview content.
- **Member**: full content + interactions.

Admin is an operational role; admin-only access is governed separately.

## 4) Key system flows (high level)
### 4.1 Admin trade publishing
Admin → create/update/close position → event log →
- public teaser surfaces update (sanitized)
- member full surfaces update
- notifications triggered for followers
- leaderboard rollups updated (scheduled)

### 4.2 Member trade logging + journaling
Member → manual entry or import → canonical ledger + events →
- personal analytics
- optional public portfolio (global toggle)
- eligible feed/leaderboard (if public)

### 4.3 Feed generation
Feed is derived from:
- followed users’ position events
- admin position events
- posts (optional)

### 4.4 Leaderboards
Leaderboards are derived from **positions-derived performance** (v1) and computed via rollups.

## 5) Scalability principles (5k–25k members)
- Precompute leaderboard rollups on schedule.
- Paginate feeds and use indexed queries.
- Cache hot reads (public teaser, leaderboards, profile previews).
- Treat notification delivery as a pipeline (retries, idempotency).

## 6) Governance principles
- Abuse controls are first-class (block/mute/report).
- Edit history is explicit for trust.
- Backfilled trades are flagged.

