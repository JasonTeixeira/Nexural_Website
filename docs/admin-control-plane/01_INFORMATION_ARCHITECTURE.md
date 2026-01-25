# Admin Control Plane — Information Architecture

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document defines the **Admin Dashboard information architecture (IA)**: routes, sidebar modules, and what each module is responsible for.

## Goals
- Create a control plane suitable for a **$10M+/yr** business.
- Ensure every admin surface reads/writes against **SSOT** sources.
- Prevent “shadow admin panels” (duplicate pages reading legacy tables).

## Global UI rules
- Sidebar default: **collapsed icon-only**.
- Each module has:
  - “Home view” (overview)
  - “Work view” (list + filters)
  - “Detail view” (audit + actions)
  - “System view” (logs/health where applicable)

## Module map (routes)

### 1) Home (Control Plane Overview)
- `/admin`

### 2) Trades (Admin Publishing)
- `/admin/positions`
- `/admin/positions/new`
- `/admin/positions/[id]`
- `/admin/positions/analytics`

### 3) Members
- `/admin/members`
- `/admin/members/[id]` *(optional v2 but recommended)*

### 4) Social + Moderation
- `/admin/moderation`
- `/admin/moderation/reports`
- `/admin/moderation/actions`

### 5) Journaling + Portfolio Governance
- `/admin/journals` *(governance view; not authoring)*
- `/admin/journals/reports` *(journal abuse/mod queue)*

### 6) Leaderboards + Competitions
- `/admin/leaderboards`
- `/admin/leaderboards/seasons`
- `/admin/leaderboards/integrity`

### 7) Growth
#### Newsletter
- `/admin/newsletter`
- `/admin/newsletter/campaigns`
- `/admin/newsletter/sequences`
- `/admin/newsletter/sends` *(send log + retries)*

#### Referrals + Points
- `/admin/referrals`
- `/admin/referrals/ledger` *(points ledger admin view)*
- `/admin/referrals/fraud` *(suspicious activity)*

### 8) AI Analytics + Billing
- `/admin/ai`
- `/admin/ai/usage`
- `/admin/ai/pricing`
- `/admin/ai/credits` *(grants/adjustments)*
- `/admin/ai/keys` *(provider keys + rotation policies)*

### 9) Marketplace Governance
- `/admin/marketplace/reports`

### 10) Ops / Reliability
- `/admin/system-monitor`
- `/admin/health`
- `/admin/webhooks` *(optional but recommended)*
- `/admin/jobs` *(optional but recommended)*
- `/admin/deletion-gates`

### 11) Settings
- `/admin/settings`

---

## Tiering (what must be built first)

### Tier‑1 (must ship for a real business)
- Trades publishing (`/admin/positions/*`)
- Members (`/admin/members`)
- Moderation queues (`/admin/moderation`)
- Newsletter management (`/admin/newsletter/*`)
- Referrals/points oversight (`/admin/referrals/*`)
- Ops monitor + deletion gates (`/admin/system-monitor`, `/admin/deletion-gates`)
- AI usage + credits admin (`/admin/ai/*`)

### Tier‑2 (can follow, but should be designed now)
- Competitions/seasons UI
- Marketplace governance expansions
- Dedicated job/webhook dashboards
- Deeper content/CMS surfaces

---

## “No drift” rule
If a route isn’t in this IA, it is not considered part of the admin control plane.
Any new admin page must:
1) be added here,
2) have an SSOT data contract entry,
3) have RBAC permissions defined.
