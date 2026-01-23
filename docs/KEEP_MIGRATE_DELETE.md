# Keep / Migrate / Delete Inventory (SSOT)

This file is the actionable inventory for refactoring and safe deletion.

## Deletion gates (must satisfy all)

A module/route/api/table can only be deleted when:

1. **Parity:** canonical replacement exists and meets SSOT requirements

2. **Traffic = 0:** telemetry/logs show no production usage for a full window (recommended 14 days)

3. **Tests:** at least one regression test covers the canonical path

4. **Rollback:** deletion is reversible via git revert and does not require DB rollback

---

## Routes (pages)

### KEEP (49)

| path | action |
| --- | --- |
| / | KEEP |
| /about | KEEP |
| /admin | KEEP |
| /admin/health | KEEP |
| /admin/members | KEEP |
| /admin/moderation | KEEP |
| /admin/newsletter | KEEP |
| /admin/newsletter/campaigns | KEEP |
| /admin/positions | KEEP |
| /admin/positions/[id] | KEEP |
| /admin/positions/analytics | KEEP |
| /admin/positions/new | KEEP |
| /admin/referrals | KEEP |
| /admin/settings | KEEP |
| /admin/system-monitor | KEEP |
| /auth/forgot-password | KEEP |
| /auth/login | KEEP |
| /auth/reset-password | KEEP |
| /auth/signup | KEEP |
| /blog | KEEP |
| /blog/[slug] | KEEP |
| /briefs/market-brief | KEEP |
| /contact | KEEP |
| /faq | KEEP |
| /how-it-works | KEEP |
| /leaderboard | KEEP |
| /legal-disclaimer | KEEP |
| /marketplace | KEEP |
| /marketplace/products/[productId] | KEEP |
| /marketplace/sellers | KEEP |
| /marketplace/sellers/[sellerId] | KEEP |
| /member-portal | KEEP |
| /member-portal/account | KEEP |
| /member-portal/analytics | KEEP |
| /member-portal/dashboard | KEEP |
| /member-portal/feed | KEEP |
| /member-portal/following | KEEP |
| /member-portal/messages | KEEP |
| /member-portal/notifications | KEEP |
| /member-portal/portfolio | KEEP |
| /member-portal/profile | KEEP |
| /member-portal/referrals | KEEP |
| /member-portal/settings | KEEP |
| /pricing | KEEP |
| /privacy | KEEP |
| /profile/[username] | KEEP |
| /refer/[code] | KEEP |
| /terms-of-service | KEEP |
| /unsubscribe | KEEP |

### MIGRATE (10)

| path | action |
| --- | --- |
| /community | MIGRATE |
| /feed | MIGRATE |
| /portfolio/[id] | MIGRATE |
| /position/[id] | MIGRATE |
| /positions | MIGRATE |
| /positions/[id] | MIGRATE |
| /positions/activity | MIGRATE |
| /positions/analytics | MIGRATE |
| /positions/open | MIGRATE |
| /positions/visualizations | MIGRATE |

### REVIEW (18)

| path | action |
| --- | --- |
| /admin/analytics | REVIEW |
| /admin/build-status | REVIEW |
| /admin/coupons | REVIEW |
| /admin/forgot-password | REVIEW |
| /admin/login | REVIEW |
| /admin/reset-password | REVIEW |
| /error | REVIEW |
| /indicators | REVIEW |
| /member-portal/affiliate | REVIEW |
| /member-portal/community | REVIEW |
| /member-portal/journal/import | REVIEW |
| /member-portal/marketplace | REVIEW |
| /member-portal/marketplace/[productId] | REVIEW |
| /member-portal/marketplace/purchases | REVIEW |
| /member-portal/marketplace/sell | REVIEW |
| /member-portal/marketplace/sell/[productId] | REVIEW |
| /member-portal/signals | REVIEW |
| /member-portal/swing-positions | REVIEW |

---

## API Endpoints

### KEEP_OR_REVIEW (88)

| path | action |
| --- | --- |
| /api/admin/analytics | KEEP_OR_REVIEW |
| /api/admin/dashboard | KEEP_OR_REVIEW |
| /api/admin/logout | KEEP_OR_REVIEW |
| /api/admin/moderation/reports | KEEP_OR_REVIEW |
| /api/admin/newsletter/analytics | KEEP_OR_REVIEW |
| /api/admin/newsletter/campaigns | KEEP_OR_REVIEW |
| /api/admin/newsletter/scheduler | KEEP_OR_REVIEW |
| /api/admin/newsletter/send-v2 | KEEP_OR_REVIEW |
| /api/admin/newsletter/subscribers | KEEP_OR_REVIEW |
| /api/admin/newsletter/templates | KEEP_OR_REVIEW |
| /api/admin/portfolio/positions | KEEP_OR_REVIEW |
| /api/admin/portfolio/positions/:id | KEEP_OR_REVIEW |
| /api/admin/portfolio/watchlist | KEEP_OR_REVIEW |
| /api/admin/positions | KEEP_OR_REVIEW |
| /api/admin/positions/:id | KEEP_OR_REVIEW |
| /api/admin/positions/:id/event | KEEP_OR_REVIEW |
| /api/admin/referrals | KEEP_OR_REVIEW |
| /api/auth/forgot-password | KEEP_OR_REVIEW |
| /api/auth/login | KEEP_OR_REVIEW |
| /api/auth/reset-password | KEEP_OR_REVIEW |
| /api/auth/verify-reset-token | KEEP_OR_REVIEW |
| /api/cron/daily-backup-and-export | KEEP_OR_REVIEW |
| /api/cron/newsletter-scheduler | KEEP_OR_REVIEW |
| /api/cron/newsletter-sequences | KEEP_OR_REVIEW |
| /api/feed | KEEP_OR_REVIEW |
| /api/health | KEEP_OR_REVIEW |
| /api/marketplace/checkout | KEEP_OR_REVIEW |
| /api/marketplace/download | KEEP_OR_REVIEW |
| /api/marketplace/products | KEEP_OR_REVIEW |
| /api/marketplace/products/:productId | KEEP_OR_REVIEW |
| /api/marketplace/reviews | KEEP_OR_REVIEW |
| /api/marketplace/seller/onboard | KEEP_OR_REVIEW |
| /api/marketplace/seller/products | KEEP_OR_REVIEW |
| /api/marketplace/seller/products/:productId | KEEP_OR_REVIEW |
| /api/marketplace/seller/products/:productId/versions | KEEP_OR_REVIEW |
| /api/marketplace/seller/profile | KEEP_OR_REVIEW |
| /api/marketplace/seller/upload-url | KEEP_OR_REVIEW |
| /api/marketplace/sellers | KEEP_OR_REVIEW |
| /api/marketplace/sellers/:sellerId | KEEP_OR_REVIEW |
| /api/member/account | KEEP_OR_REVIEW |
| /api/member/block | KEEP_OR_REVIEW |
| /api/member/change-password | KEEP_OR_REVIEW |
| /api/member/dashboard | KEEP_OR_REVIEW |
| /api/member/following | KEEP_OR_REVIEW |
| /api/member/logout | KEEP_OR_REVIEW |
| /api/member/notifications | KEEP_OR_REVIEW |
| /api/member/positions | KEEP_OR_REVIEW |
| /api/member/referrals | KEEP_OR_REVIEW |
| /api/member/report | KEEP_OR_REVIEW |
| /api/member/settings | KEEP_OR_REVIEW |
| /api/member/signals | KEEP_OR_REVIEW |
| /api/member/unified-feed | KEEP_OR_REVIEW |
| /api/member/update-profile | KEEP_OR_REVIEW |
| /api/newsletter/open | KEEP_OR_REVIEW |
| /api/newsletter/subscribe | KEEP_OR_REVIEW |
| /api/newsletter/subscribers | KEEP_OR_REVIEW |
| /api/portfolio/calendar | KEEP_OR_REVIEW |
| /api/portfolio/follow | KEEP_OR_REVIEW |
| /api/portfolio/heatmap | KEEP_OR_REVIEW |
| /api/portfolio/stats | KEEP_OR_REVIEW |
| /api/positions/:id | KEEP_OR_REVIEW |
| /api/positions/:id/comments | KEEP_OR_REVIEW |
| /api/positions/:id/comments/:commentId/like | KEEP_OR_REVIEW |
| /api/positions/:id/share | KEEP_OR_REVIEW |
| /api/positions/activity | KEEP_OR_REVIEW |
| /api/positions/bulk-close | KEEP_OR_REVIEW |
| /api/positions/bulk-delete | KEEP_OR_REVIEW |
| /api/positions/enhanced-analytics | KEEP_OR_REVIEW |
| /api/positions/events/recent | KEEP_OR_REVIEW |
| /api/positions/images/:id | KEEP_OR_REVIEW |
| /api/positions/images/upload | KEEP_OR_REVIEW |
| /api/positions/open | KEEP_OR_REVIEW |
| /api/positions/stats | KEEP_OR_REVIEW |
| /api/positions/summary | KEEP_OR_REVIEW |
| /api/public/admin-positions | KEEP_OR_REVIEW |
| /api/public/feed | KEEP_OR_REVIEW |
| /api/public/marketplace/products | KEEP_OR_REVIEW |
| /api/public/marketplace/products/:productId | KEEP_OR_REVIEW |
| /api/public/marketplace/reviews | KEEP_OR_REVIEW |
| /api/public/marketplace/sellers/:sellerId | KEEP_OR_REVIEW |
| /api/search | KEEP_OR_REVIEW |
| /api/social/content/comments | KEEP_OR_REVIEW |
| /api/social/content/like | KEEP_OR_REVIEW |
| /api/social/posts | KEEP_OR_REVIEW |
| /api/social/posts/:postId/comments | KEEP_OR_REVIEW |
| /api/social/posts/:postId/like | KEEP_OR_REVIEW |
| /api/webhooks/stripe | KEEP_OR_REVIEW |
| /api/webhooks/stripe-marketplace | KEEP_OR_REVIEW |

### MIGRATE (1)

| path | action |
| --- | --- |
| /api/admin/unified-dashboard | MIGRATE |

### DELETE (3)

| path | action |
| --- | --- |
| /api/trading/performance | DELETE |
| /api/trading/positions | DELETE |
| /api/trading/signals | DELETE |

### DELETE_OR_ARCHIVE (2)

| path | action |
| --- | --- |
| /api/dev/seed-demo | DELETE_OR_ARCHIVE |
| /api/dev/seed-portfolio | DELETE_OR_ARCHIVE |

### REVIEW (9)

| path | action |
| --- | --- |
| /api/community/follow | REVIEW |
| /api/export/positions | REVIEW |
| /api/journal/analytics/summary | REVIEW |
| /api/journal/import | REVIEW |
| /api/journal/import-templates | REVIEW |
| /api/watchlist | REVIEW |
| /api/watchlist/:id | REVIEW |
| /api/watchlist/positions | REVIEW |
| /api/watchlist/quote/:ticker | REVIEW |

---

## Tables (Top referenced)

This section starts from the audit top tables list. Many additional tables exist; they will be classified during implementation refactor.

### MIGRATE (4)

| name | refs | action |
| --- | --- | --- |
| portfolio_positions | 7 | MIGRATE |
| position_activity | 7 | MIGRATE |
| swing_positions | 7 | MIGRATE |
| live_trades | 5 | MIGRATE |

### REVIEW (56)

| name | refs | action |
| --- | --- | --- |
| members | 69 | REVIEW |
| algo_trading_waitlist | 38 | REVIEW |
| user_profiles | 38 | REVIEW |
| positions | 28 | REVIEW |
| newsletter_subscribers | 22 | REVIEW |
| trading_positions | 22 | REVIEW |
| blog_posts | 21 | REVIEW |
| newsletter_campaigns | 21 | REVIEW |
| portfolios | 21 | REVIEW |
| follows | 19 | REVIEW |
| signals | 16 | REVIEW |
| referral_codes | 14 | REVIEW |
| blog_categories | 13 | REVIEW |
| blog_tags | 13 | REVIEW |
| discord_webhooks | 12 | REVIEW |
| marketplace_products | 12 | REVIEW |
| marketplace_sellers | 12 | REVIEW |
| social_posts | 11 | REVIEW |
| portfolio_follows | 9 | REVIEW |
| user_notifications | 9 | REVIEW |
| webhook_events | 9 | REVIEW |
| admin_tokens | 8 | REVIEW |
| admin_users | 8 | REVIEW |
| content_likes | 8 | REVIEW |
| points_ledger | 8 | REVIEW |
| referrals | 8 | REVIEW |
| subscriptions | 8 | REVIEW |
| user_2fa | 8 | REVIEW |
| waitlist_leaderboard | 8 | REVIEW |
| position_events | 7 | REVIEW |
| trade_results | 7 | REVIEW |
| two_factor_auth | 7 | REVIEW |
| import_jobs | 6 | REVIEW |
| live_market_data | 6 | REVIEW |
| newsletter_templates | 6 | REVIEW |
| notifications | 6 | REVIEW |
| tracked_signals | 6 | REVIEW |
| user_blocks | 6 | REVIEW |
| waitlist_activity_log | 6 | REVIEW |
| watchlist | 6 | REVIEW |
| affiliate_referrals | 5 | REVIEW |
| affiliates | 5 | REVIEW |
| coupons | 5 | REVIEW |
| member_portfolios | 5 | REVIEW |
| ml_training_features | 5 | REVIEW |
| open_positions | 5 | REVIEW |
| portfolio_trades | 5 | REVIEW |
| position_comment_reactions | 5 | REVIEW |
| position_images | 5 | REVIEW |
| position_shares | 5 | REVIEW |
| position_targets | 5 | REVIEW |
| strategy_performance | 5 | REVIEW |
| newsletter_sends | 4 | REVIEW |
| portfolio_watchlist | 4 | REVIEW |
| profiles | 4 | REVIEW |
| referral_events | 4 | REVIEW |
