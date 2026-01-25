# Admin Control Plane — Referrals & Points Admin

Status: **Draft (v1)**  
Owner: Nexural Admin  
Updated: 2026-01-25

This document defines the admin control plane for:
- referrals
- attribution
- points ledger
- anti-fraud

Upstream SSOT:
- `docs/REFERRALS_POINTS_SPEC.md`

---

## A) Roles / permissions
- `owner`: full access
- `support`: read-only (default)
- `content`: read-only

Owner-only actions:
- ledger adjustments
- revocations
- fraud overrides

---

## B) Admin surfaces

### 1) `/admin/referrals` (overview)
Must show:
- referral signups over time
- conversion funnel (click → signup → verify)
- points issued over time
- top referrers

### 2) `/admin/referrals/ledger`
Points ledger:
- immutable transactions list
- filters by member, date, type
- audit trail for adjustments

### 3) `/admin/referrals/fraud`
Fraud & abuse signals:
- multiple signups from same device/IP
- unusual click-to-signup patterns
- rapid repeated referrals

---

## C) Points integrity requirements
- points are append-only ledger transactions
- no silent edits of totals
- totals are derived from ledger

---

## D) Tech spec (data requirements)
Conceptual entities:
- referral codes
- referral attribution events
- points ledger
- fraud signals table/log
