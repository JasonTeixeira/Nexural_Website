# Marketplace Spec (Tier‑1 SSOT)

Marketplace is secondary to the core trading-social loop, but must be professional.

The marketplace enables members to:
- become sellers
- list digital products (indicators/code/systems)
- sell to other members

Platform takes **20%**.

---

## 1) Goals
1) Create a creator economy that increases retention.
2) Provide high-quality tools to members.
3) Generate revenue with minimal support burden.

---

## 2) Roles
- **Buyer**: any signed-in member.
- **Seller**: a member who completes seller onboarding.
- **Admin**: governance and dispute resolution.

---

## 3) Seller onboarding
Seller onboarding must capture:
- seller profile (display name, bio)
- payout setup (Stripe Connect or equivalent)
- agreement to marketplace terms

---

## 4) Product model
Product types:
- indicator
- code
- system
- other (future)

Product attributes:
- title, description
- price
- category/tags
- version history
- support/contact info

---

## 5) Purchase and entitlements

### 5.1 Purchase
Buyer purchases a product.

### 5.2 License/entitlement
After purchase, buyer receives:
- license record
- download entitlement

Entitlements must support:
- multiple product versions
- access to updates (policy-defined)

---

## 6) Revenue share
Platform fee:
- 20% of purchase price

Seller receives:
- 80% net (minus payment processing fees as applicable)

---

## 7) Reviews and trust
To be professional, marketplace requires:
- reviews/ratings
- seller reputation signals
- dispute/report mechanisms

Anti-spam rule:
- only verified purchasers can review.

---

## 8) Admin governance
Admin can:
- remove products
- suspend sellers
- resolve disputes
- review fraud signals

---

## 9) Reliability
Marketplace must be robust:
- webhook-driven payment confirmation
- retries for failed webhooks
- idempotent purchase creation
- clear audit logs

---

## 10) Public vs member access
- Browsing products/sellers is public (SEO).
- Purchasing and downloading requires membership.

