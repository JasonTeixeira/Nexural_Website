# PRD — Nexural Trading (SSOT)

## 1) One‑sentence product
**Nexural is a trade‑tracking + transparency social network (no trade execution) where members follow admin swing trades, optionally share their own portfolios/trades, and compete on performance leaderboards.**

## 2) North Star Goal
Build a daily‑use platform that reliably converts visitors into members who:
1) follow Admin trades,
2) receive useful alerts,
3) optionally log/journal their own trades,
4) discover and follow other traders,
5) compete on leaderboards,
6) invite others via referrals.

## 3) Primary user personas
- **Visitor**: arrives via SEO/newsletter/social proof.
- **Member (Follower)**: follows admin trades, consumes alerts/feed.
- **Member (Creator)**: logs trades, shares public portfolio, participates in leaderboard.
- **Admin**: publishes trades, content, newsletters, moderation, ops.

## 4) Product scope (in)
### Core
- Admin trade publishing (manual entry) for **stocks + options (up to 4 legs)**.
- Public teaser (sanitized) + member‑only full trade detail.
- Member dashboards: follow admin, follow members, feed, notifications.
- Positions/trades: manual entry + journaling.
- Analytics: portfolio performance across timeframes.
- Leaderboards + discovery.
- Referrals + points.
- Blog for SEO.
### Secondary
- Marketplace (sell indicators/systems/code; platform takes 20%).
- Payments/entitlements infrastructure (free until ~500 members; flip switch later).

## 5) Explicit non‑scope (out)
- **No trade execution** for members.
- No broker “write” integration.
- No high‑frequency/scalping tooling emphasis.

## 6) Public vs member access rules
### Public
- Admin trades teaser is public.
  - hides **entry price and sizing** (and any fields that reveal them).
  - shows enough for trust/discovery.
### Member
- Full admin trade detail.
- Alerts.
- Community features (follow, comment, like).
- Member portfolio pages + analytics.

## 7) Privacy policy (member portfolios)
- A member chooses **one global mode**:
  - **Public**: all positions/portfolio visible.
  - **Private**: none visible.

## 8) Edits & integrity
- Edits are allowed.
- **Every edit is logged** and visible as an amendment history.
- Backfilled/imported data must be flagged.

## 9) Onboarding rule
- On signup, user lands in **Member Dashboard**.
- “Follow Admin” is **mandatory** for full experience (enforced by onboarding gate + backend subscription rules).

## 10) Metrics (targets)
- Activation: % of new signups who follow Admin and enable alerts.
- Retention: DAU/WAU, alert engagement.
- Virality: invites per active member, referral conversion.
- Trust: leaderboard integrity (low fraud/disputes).
- Monetization readiness: ability to flip paid tiers without rebuild.

