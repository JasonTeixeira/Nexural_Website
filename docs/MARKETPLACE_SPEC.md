# Marketplace Spec (Tier‑1 SSOT)

> Status: **Final (2026-01-25)**
> Tie-breaker: `docs/SSOT_DONE_CHECKLIST.md` + `docs/DECISIONS_LOCKED_2026-01-25.md`

Marketplace is secondary to the core trading‑social loop, but it must be production‑grade: reliable payments, clean entitlements, auditability, and professional trust/safety.

The marketplace enables members to:
- become sellers
- list digital products (scripts/indicators/code/systems, etc.)
- sell to other members

Platform fee: **20%**.

See: `docs/DECISIONS_LOCKED_2026-01-25.md`

> **SSOT note:** the canonical “can this user download/access?” source of truth is `marketplace_entitlements`.

---

## 1) Goals
1) Create a creator economy that increases retention.
2) Provide high‑quality tools to members.
3) Generate revenue with minimal support burden.
4) Maintain trust: verified reviews, moderation, and dispute/report tooling.

---

## 2) Roles
- **Buyer**: any signed‑in member.
- **Seller**: a member who completes seller onboarding.
- **Admin**: governance, moderation, and dispute resolution.

---

## 3) Seller onboarding & lifecycle

Seller onboarding must capture:
- seller profile (display name, bio)
- support contact (email or equivalent)
- payout setup (Stripe Connect)
- agreement to marketplace terms (timestamped)

Seller lifecycle expectations:
- Sellers can be **active**, **paused**, or **suspended** by admins.
- Sellers own products and are responsible for:
  - product quality and support
  - version updates / changelogs
  - complying with platform rules

---

## 4) Product catalog & listing model

### 4.1 Where products come from
- A seller creates products from their **seller profile**.
- Products have a stable public URL (slug) for SEO and sharing.

### 4.2 Product types
Supported product types (expandable):
- **indicator**
- **script**
- **code**
- **system**
- **other**

### 4.3 Product attributes
Products should include:
- title, description, screenshots/media (future)
- price (see Pricing Models)
- category/tags
- support/contact info
- status lifecycle (draft → active → paused → retired)

### 4.4 Versions (updates)
Products can have multiple versions.
- Each version has:
  - semantic version string (e.g. `1.2.0`)
  - changelog
  - storage path (downloadable artifact)

**Update access policy** (initial):
- A purchase grants download access to the latest version available at time of download, unless a product is explicitly retired.
- Future: sellers can offer “paid major upgrades” or time‑boxed update windows.

---

## 5) Fulfillment modes

Different products can be fulfilled in different ways:

1) **Download (v1)**
   - Buyer downloads files hosted in platform storage.
   - Entitlement gate is enforced server‑side.

2) **License key**
   - After purchase, buyer receives a license key (generated or provisioned).
   - Key can be regenerated/rotated by admin (and potentially seller) with audit logs.

3) **Service / Access**
   - Purchase grants access to a service/community (e.g., private Discord, data feed, coaching portal).
   - Entitlement is still the canonical record; downstream integrations consume it.

---

## 6) Pricing models

### 6.1 V1 — One‑time purchase (current)
- Buyer pays once.
- Buyer receives entitlement immediately on successful payment.

### 6.2 V2 — Subscriptions (planned)
Subscription support extends the model with recurring billing:
- plans: monthly/annual
- renewal, cancellation, grace periods
- payment failure handling

**Entitlement semantics for subscriptions:**
- Active subscription ⇒ entitlement status `active`.
- Past‑due/unpaid beyond grace ⇒ entitlement status `revoked` (or `inactive`).
- Cancellation effective at period end ⇒ entitlement remains active until period end.

---

## 7) Purchase flow & entitlements (SSOT)

### 7.1 Purchase flow
1) Buyer selects product and starts checkout.
2) Platform creates a Stripe Checkout Session.
3) **Stripe webhook** confirms payment success.
4) Platform writes:
   - legacy rows (where still used): `marketplace_orders`, `marketplace_order_items`, `marketplace_licenses`
   - **SSOT row:** upsert `marketplace_entitlements(buyer_user_id, product_id)`

### 7.2 SSOT: Entitlements
`marketplace_entitlements` is the canonical “can download/access” table.

Rules:
- Entitlements are idempotently created/upserted from webhooks.
- Entitlements are unique per `(buyer_user_id, product_id)`.
- Download endpoint must enforce entitlement status (active only).

### 7.3 Idempotency & audit
- Webhook processing must be idempotent (event replay safe).
- Maintain an append‑only webhook audit log with unique `(provider, event_id)`.

---

## 8) Reviews, ratings, and seller reputation

### 8.1 Reviews/ratings
To be professional, marketplace requires reviews/ratings.

Rules:
- **Only verified purchasers can review** (entitlement gate).
- One review per user per product.

### 8.2 Reputation signals (initial)
- Average rating (with minimum review count before showing prominently)
- Refund/report rate (internal)
- Seller responsiveness/support metrics (future)

---

## 9) Trust & safety (reports/disputes)

Users can report:
- misleading claims
- malware/unsafe downloads
- IP infringement
- spam

Report handling:
- Reports enter an admin queue with status `open` → `in_review` → `resolved`.
- Admin actions include takedown, refund assistance, or seller suspension.

---

## 10) Admin governance
Admin can:
- remove/hide products
- suspend sellers
- resolve disputes
- review fraud signals
- override entitlements in exceptional cases (with audit trail)

---

## 11) Reliability / Operations

Operational requirements:
- webhook‑driven payment confirmation
- retries for failed webhooks
- idempotent purchase creation
- clear audit logs (`marketplace_webhook_events`)

---

## 12) Public vs member access
- Browsing products/sellers is public (SEO).
- Purchasing and downloading requires membership.

---

# Appendix A — SSOT DB/API mapping

This appendix maps the product spec to the current SSOT schema + the existing API surface.

## A.1 Tables (high‑signal columns)

### `marketplace_sellers`
- `id` (uuid)
- `user_id` (uuid)
- `status` (text)
- `stripe_connect_account_id` (text)
- `stripe_connect_onboarded` (bool)
- `terms_accepted_at` (timestamptz)
- `support_email`, `bio`

### `marketplace_products`
- `id` (uuid)
- `seller_id` (uuid)
- `type` (text)
- `title`, `description`
- `price_cents`, `currency`
- `tags` (text[])
- `status` (text)

### `marketplace_product_versions`
- `id` (uuid)
- `product_id` (uuid)
- `version` (text)
- `changelog` (text)
- `storage_path` (text)

### `marketplace_orders` (legacy + compatibility)
- `id` (uuid)
- `buyer_user_id` (uuid)
- `product_id` (uuid)
- `amount_cents`
- `platform_fee_bps`
- `seller_net_cents`
- `stripe_checkout_session_id` (unique)

### `marketplace_order_items` (legacy)
- used by legacy purchase flows; kept for backwards compatibility.

### `marketplace_licenses` (legacy)
- used for legacy “license record”; kept for backwards compatibility.

### `marketplace_entitlements` (SSOT canonical)
- `id` (uuid)
- `buyer_user_id` (uuid)
- `product_id` (uuid)
- `granted_order_id` (uuid, nullable)
- `granted_at`
- `status` (text: `active`/`revoked`)
- unique `(buyer_user_id, product_id)`

### `marketplace_reviews`
- `id` (uuid)
- `product_id` (uuid)
- `buyer_user_id` (uuid)
- `rating` (1–5)
- `body`
- unique `(product_id, buyer_user_id)`

### `marketplace_reports`
- `id` (uuid)
- `product_id` (uuid, nullable)
- `reporter_user_id` (uuid, nullable)
- `reason`, `details`
- `status` (text)

### `marketplace_webhook_events`
- `id` (uuid)
- `provider` (text)
- `event_id` (text, unique per provider)
- `event_type` (text)
- `payload` (jsonb)
- `processed`, `processed_at`

## A.2 API endpoints (current)

Member (auth required):
- `POST /api/member/marketplace/seller` — create/update seller profile
- `POST /api/member/marketplace/stripe-connect/onboard` — start Stripe Connect onboarding
- `POST /api/member/marketplace/stripe-connect/sync` — sync Connect status
- `GET|POST /api/member/marketplace/products` — list/create products
- `GET|PATCH|DELETE /api/member/marketplace/products/[id]` — manage a product
- `GET|POST /api/member/marketplace/products/[id]/versions` — list/create versions
- `POST /api/member/marketplace/checkout` — create Stripe checkout session
- `GET /api/member/marketplace/purchases` — buyer purchase history
- `GET /api/member/marketplace/download` — entitlement‑gated download

Public:
- `GET /api/public/marketplace/products` — public product browsing

Webhooks:
- `POST /api/webhooks/stripe-marketplace` — Stripe webhook (creates orders + entitlements)
