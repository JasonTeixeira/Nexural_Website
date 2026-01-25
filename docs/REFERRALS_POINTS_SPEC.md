# Referrals & Points Spec (Tier‑1 SSOT)

> Status: **Final (2026-01-25)**
> Tie-breaker: `docs/SSOT_DONE_CHECKLIST.md` + `docs/DECISIONS_LOCKED_2026-01-25.md`

This document defines the viral growth engine:
- referral codes
- attribution rules
- points ledger rules
- anti-fraud constraints
- redemption (future)

---

## 1) Goals
1) Increase member growth via referrals.
2) Incentivize members to invite quality users.
3) Avoid fraud and abuse.

---

## 2) Core concepts
### 2.1 Referral Code
- Each member has a referral code.
- The code can be shared as a URL.

### 2.2 Referral Attribution
Attribution occurs when a new user signs up after arriving via a referral code.

### 2.3 Points Ledger
Points are tracked as an **immutable ledger**.

Ledger transaction types:
- earn (signup)
- earn (milestone)
- burn (redemption)
- adjustment (admin)

---

## 3) Referral lifecycle
1) Referrer shares code link.
2) Visitor lands on referral page.
3) Visitor signs up.
4) System attributes signup to referrer.
5) Points are awarded to referrer.

---

## 4) Attribution rules (v1)
Professional default rules:
- One signup can be attributed to **at most one** referrer.
- First-touch attribution within a window (recommended):
  - referral cookie stored for X days (e.g., 30 days)
- If a user already has an account, no new attribution.

---

## 5) Points rules (v1)
### 5.1 Earning
Default earn events:
- +N points per referred signup that verifies email.

Optional earn milestones:
- referral reaches “active member” status (e.g., follows admin + enables alerts)

### 5.2 When points are granted
Points are granted when:
- new user verifies email
- (optional) new user completes activation milestone

### 5.3 Points visibility
Members can see:
- total points
- ledger history (earn/burn entries)

---

## 6) Anti-fraud controls
At minimum:
- do not award points until email verified
- rate limit referral link usage
- detect multiple signups from same device/IP patterns

Optional hardening:
- require activation milestone before awarding
- cap points per day

Admin moderation:
- admin can revoke points via ledger adjustment

---

## 7) Redemption (future)
Points will be redeemable for:
- marketplace credit
- discounts
- perks

Rules:
- redemption is a ledger burn transaction
- redemption creates an entitlement/credit

---

## 8) UX requirements
### Member dashboard
- show referral code + share link
- show points total
- show progress to next milestone (optional)

### Admin dashboard
- show referral program stats
- show suspicious activity and overrides

