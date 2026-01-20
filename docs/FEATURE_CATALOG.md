# Feature Catalog (SSOT)

This is the exhaustive catalog of platform features.

For each feature we define:
- **Purpose** (why it exists)
- **Audience** (public/member/admin)
- **Primary screens** (routes)
- **Key inputs** (user actions)
- **Key outputs** (data shown / events emitted)
- **Depends on domains** (from `ARCHITECTURE.md`)

> Note: Tier‑1 features are expanded in Phase 4 deep specs.

---

## 1) Public Web (Discovery + SEO)

### 1.1 Landing / Marketing
- **Audience:** Public
- **Routes:** `/`, `/about`, `/pricing`, `/how-it-works`, `/contact`, `/faq`
- **Purpose:** convert visitors to newsletter subscribers and signups.
- **Outputs:** newsletter signup events; CTA to create account.

### 1.2 Blog (SEO engine)
- **Audience:** Public
- **Routes:** `/blog`, `/blog/[slug]`
- **Purpose:** capture organic search traffic and convert to newsletter/signup.
- **Outputs:** view tracking; newsletter signup.
- **Depends on:** Content/SEO, Growth.

### 1.3 Briefs / Newsletter archive
- **Audience:** Public
- **Routes:** `/briefs/market-brief`
- **Purpose:** high-frequency content loop and capture emails.
- **Depends on:** Growth, Content/SEO.

### 1.4 Public Community/Leaderboard Teasers
- **Audience:** Public
- **Routes:** `/community`, `/leaderboard`, `/profile/[username]`
- **Purpose:** social proof + discovery; convert to member signup.
- **Outputs:** teaser profile views; gated follow actions.
- **Depends on:** Social Graph, Leaderboards & Discovery.

### 1.5 Public Marketplace Browsing
- **Audience:** Public
- **Routes:** `/marketplace`, `/marketplace/sellers`, `/marketplace/sellers/[sellerId]`, `/marketplace/products/[productId]`
- **Purpose:** SEO + product discovery; convert to signup/purchase.
- **Outputs:** product views; CTA to sign up.
- **Depends on:** Marketplace.

---

## 2) Authentication

### 2.1 Signup / Login / Password Reset
- **Audience:** Public
- **Routes:** `/auth/signup`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`
- **Purpose:** email-only onboarding.
- **Depends on:** Identity & Profiles.

---

## 3) Member Experience (Core)

### 3.1 Member Dashboard (Home)
- **Audience:** Member
- **Routes:** `/member-portal`, `/member-portal/dashboard`
- **Purpose:** daily home; onboarding; follow-admin mandatory.
- **Inputs:** follow admin; enable alerts; complete profile.
- **Outputs:** onboarding completion state; follow relationship; alert subscriptions.
- **Depends on:** Identity, Social Graph, Feed & Notifications, Trading Ledger.

### 3.2 Admin Trades Viewing (“My Live Trades”)
- **Audience:** Member (full)
- **Routes:** `/positions`, `/positions/open`, `/positions/[id]`, `/positions/activity`, `/positions/analytics`, `/positions/visualizations`
- **Purpose:** transparency view of admin swing trades with high quality visuals.
- **Inputs:** follow admin; watchlist/follow specific trade (optional).
- **Outputs:** alerts; engagement.
- **Depends on:** Trading Ledger, Events, Feed & Notifications.

### 3.3 Member Portfolio (Public/Private toggle)
- **Audience:** Member
- **Routes:** `/member-portal/portfolio`, `/portfolio/[id]`
- **Purpose:** member sees their performance; can share publicly if toggled.
- **Inputs:** set public/private; enter trades; import trades.
- **Outputs:** performance rollups; eligible leaderboard participation.
- **Depends on:** Trading Ledger, Leaderboards.

### 3.4 Member Trade Logging
- **Audience:** Member
- **Routes:** member trade entry UI (to be standardized) + journal import pages.
- **Purpose:** manual positions logging for stocks/options.
- **Outputs:** positions + legs + events.
- **Depends on:** Trading Ledger.

### 3.5 Journaling
- **Audience:** Member
- **Routes:** `/member-portal/journal/import` (v1) and future journal pages.
- **Purpose:** structured reflection + analytics.
- **Outputs:** journal entries, screenshots, playbook tags.
- **Depends on:** Trading Ledger.

### 3.6 Member Feed
- **Audience:** Member
- **Routes:** `/member-portal/feed`, `/member-portal/community`
- **Purpose:** see activity from admin + followed traders.
- **Outputs:** engagement.
- **Depends on:** Feed, Social Graph.

### 3.7 Following
- **Audience:** Member
- **Routes:** `/member-portal/following`
- **Purpose:** manage followed traders.
- **Depends on:** Social Graph.

### 3.8 Notifications
- **Audience:** Member
- **Routes:** `/member-portal/notifications`
- **Purpose:** in-app alert inbox.
- **Depends on:** Notifications.

### 3.9 Messaging (DMs)
- **Audience:** Member
- **Routes:** `/member-portal/messages`
- **Purpose:** 1:1 conversations.
- **Depends on:** Social Graph.

### 3.10 Member Analytics
- **Audience:** Member
- **Routes:** `/member-portal/analytics`
- **Purpose:** performance analytics.
- **Depends on:** Trading Ledger, Leaderboards rollups.

### 3.11 Referrals
- **Audience:** Member
- **Routes:** `/member-portal/referrals`
- **Purpose:** invite growth loop; points accumulation.
- **Depends on:** Growth Engine.

### 3.12 Member Settings & Profile
- **Audience:** Member
- **Routes:** `/member-portal/settings`, `/member-portal/profile`, `/member-portal/account`
- **Purpose:** privacy toggle (public/private), notification prefs.
- **Depends on:** Identity.

### 3.13 Member Marketplace
- **Audience:** Member
- **Routes:** `/member-portal/marketplace/*`
- **Purpose:** buy/sell tools.
- **Depends on:** Marketplace.

---

## 4) Admin Operations

### 4.1 Admin Dashboard Home
- **Audience:** Admin
- **Routes:** `/admin`
- **Purpose:** operational overview.

### 4.2 Admin Positions (Publishing)
- **Audience:** Admin
- **Routes:** `/admin/positions`, `/admin/positions/new`, `/admin/positions/[id]`, `/admin/positions/analytics`
- **Purpose:** create/update/close admin swing trades.
- **Outputs:** canonical positions + events; triggers feed/alerts.
- **Depends on:** Trading Ledger + Events.

### 4.3 Admin Members
- **Audience:** Admin
- **Routes:** `/admin/members`
- **Purpose:** user support + oversight.

### 4.4 Admin Newsletter
- **Audience:** Admin
- **Routes:** `/admin/newsletter`, `/admin/newsletter/campaigns`
- **Purpose:** manage capture + sequences + campaigns.
- **Depends on:** Growth Engine.

### 4.5 Admin Referrals
- **Audience:** Admin
- **Routes:** `/admin/referrals`
- **Purpose:** oversee referral program.

### 4.6 Admin Moderation
- **Audience:** Admin
- **Routes:** `/admin/moderation`
- **Purpose:** handle reports and abuse.

### 4.7 Admin System Ops
- **Audience:** Admin
- **Routes:** `/admin/system-monitor`, `/admin/health`, `/admin/build-status`, `/admin/settings`
- **Purpose:** operational reliability.

---

## 5) Cross-cutting platform features

### 5.1 Search & Discovery
- **Audience:** Public/member
- **Purpose:** discover traders + content.

### 5.2 Rate limiting + abuse prevention
- **Audience:** System
- **Purpose:** protect community and infra.

### 5.3 Webhooks & Jobs
- **Audience:** System
- **Purpose:** reliable email + marketplace + pipelines.

