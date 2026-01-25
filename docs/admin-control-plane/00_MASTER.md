# Admin Control Plane Spec Pack (10M Mini‑SaaS)

Status: **Authoritative build spec (in progress)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This folder is the **single operating manual** for building and refactoring the Nexural Admin Dashboard into a **$10M+/yr-ready control plane**.

## Non‑negotiables
1) **Single Source of Truth (SSOT):**
   - Admin publishing is the “truth producer”.
   - All admin trade actions must emit canonical `position.*` events.
   - Downstream systems (feed, alerts, analytics, leaderboards, audit history) are driven by the canonical ledger + event spine.

2) **Safety + Governance:**
   - RBAC is enforced end-to-end (UI + API).
   - Every privileged mutation is auditable.
   - Legacy deletion happens only via **deletion gates** + proof of zero usage.

3) **Operational Excellence:**
   - Admin is the control plane for: trading ops, members, growth, moderation, revenue, AI usage.
   - Failure visibility is first-class (jobs/webhooks/queues).

4) **No corners on data integrity:**
   - Immutable ledgers and append-only event logs where required.
   - Idempotency on critical workflows (email sends, credit grants, event fanout).

---

## Source-of-truth documents
These documents are upstream constraints; this spec pack must not contradict them:
- `docs/DOMAIN_MODEL.md`
- `docs/TRADING_LEDGER_SPEC.md`
- `docs/EVENT_TAXONOMY.md`
- `docs/PERMISSIONS_PRIVACY.md`
- `docs/REFACTOR_PLAN.md`
- `docs/SSOT_PHASE_COMPLETION.md`
- `docs/NEWSLETTER_SPEC.md`
- `docs/REFERRALS_POINTS_SPEC.md`
- `docs/LEADERBOARD_DISCOVERY_SPEC.md`

---

## Decisions locked in this chat
These are binding requirements for implementation:

### RBAC
Roles:
- **owner**: full access
- **support**: members + moderation + governance (no trade publishing)
- **content**: newsletter/content operations (no trade publishing)

Trade publishing permissions:
- **Only `owner` can publish/modify admin trades**.

### Privacy / Leaderboards
- Portfolio visibility is **Public/Private**.
- Leaderboard eligibility is a **separate toggle** from Public/Private.

### AI Monetization
- Monetization model: **Hybrid**
  - Monthly included credits/allowance
  - Additional **credit packs** (Stripe one-time purchases)
  - Admin controls: quotas, rate limits, kill switch, audit log

---

## How to use this spec pack
Read in order:
1) Foundations: `00` → `04`
2) Trade publishing: `10`
3) Social + governance: `11` → `13`
4) Growth engine: `20` → `21`
5) AI + billing: `30`

Implementation is done in a separate workflow/chat, but must follow:
- acceptance criteria
- API/data contracts
- deletion-gate checkpoints

---

## Index

### Foundations
1) `00_MASTER.md` (this file)
2) `01_INFORMATION_ARCHITECTURE.md`
3) `02_RBAC_PERMISSIONS.md`
4) `03_DATA_CONTRACTS_SSOT.md`
5) `04_BUILD_PHASES_ACCEPTANCE.md`

### Core control-plane modules
6) `10_TRADE_PUBLISHING_WORKBENCH.md`
7) `11_MEMBER_SOCIAL_GRAPH_MODERATION.md`
8) `12_JOURNALING_PRIVACY_LEADERBOARD_ELIGIBILITY.md`
9) `13_LEADERBOARDS_COMPETITIONS_ADMIN.md`

### Growth + revenue
10) `20_NEWSLETTER_ADMIN.md`
11) `21_REFERRALS_POINTS_ADMIN.md`
12) `30_AI_ANALYTICS_BILLING_TOKENS_ADMIN.md`

### Optional (recommended)
- `40_METRICS_KPI_DICTIONARY.md`
- `50_OPS_RUNBOOK_ADMIN.md`
