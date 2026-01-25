# Leaderboards & Discovery Spec (Tier‑1 SSOT)

> Status: **Final (2026-01-25)**
> Tie-breaker: `docs/SSOT_DONE_CHECKLIST.md` + `docs/DECISIONS_LOCKED_2026-01-25.md`

This document defines:
- how portfolio performance is computed for leaderboards (v1)
- eligibility rules
- anti-cheat and integrity constraints
- discovery filters and ranking

It depends on:
- `TRADING_LEDGER_SPEC.md` for the canonical ledger
- `PERMISSIONS_PRIVACY.md` for portfolio visibility
- `EVENT_TAXONOMY.md` for audit/amendments

---

## 1) Leaderboard purpose
Leaderboards create:
- competition
- discovery of high performers
- daily engagement

They must be:
- fair
- resistant to gaming
- computationally scalable

---

## 2) Eligibility
To appear on leaderboards, a member must:
1) have a **public portfolio** (global toggle)
2) have a completed minimum profile (bio + tags)
3) meet a minimum activity threshold (recommended)
   - e.g., ≥ 5 positions and ≥ 30 days history (tunable)

If a member toggles portfolio to private:
- they are removed from leaderboards.

---

## 3) Timeframes
Leaderboards are computed for:
- 30 days
- 60 days
- 90 days

Optionally:
- YTD
- all time

---

## 4) Performance definition (v1)
v1 is **positions-derived P&L**.

### 4.1 Included positions
Positions are included if they overlap the timeframe window.

Rules:
- Closed positions: include realized P&L if closed in window.
- Open positions: include unrealized P&L snapshot at the time of rollup.

Open position inclusion rule (to avoid ambiguity):
- If a position was opened before the window and is still open, include its unrealized P&L delta within the window via periodic snapshots.
- If snapshots are not available in v1, include current unrealized P&L but label leaderboard metric as “approximate”.

### 4.2 Primary ranking metric (recommended)
**Return %** based on position-derived P&L relative to capital at risk.

Because we do not model cash/equity curve in v1, we define:

#### Capital-at-risk proxy
- Stocks: `abs(entry_price * shares)`
- Options: `abs(entry_premium * contracts * multiplier)` aggregated per leg

#### Timeframe return %
`return_pct = (total_pnl / total_capital_at_risk) * 100`

This is simple, explainable, and resistant to “infinite leverage” claims because it’s normalized.

### 4.3 Secondary metrics (for display)
- total_pnl (realized + unrealized)
- win_rate (#winning_positions / #closed_positions)
- profit_factor (sum gains / sum losses)
- average_r_multiple (if R is modeled)
- max_drawdown proxy (optional)

---

## 5) Anti-cheat / integrity

### 5.1 Backfill handling
Backfilled/imported positions are allowed but must be flagged.

Recommended default:
- backfilled positions are included in analytics
- backfilled positions are **excluded from leaderboard** until aged **14 days**

### 5.2 Edit/amendment handling
Edits are allowed but must emit amendment events.

Leaderboard hardening (recommended):
- if a position was amended after closure, the leaderboard UI shows “amended” badge
- suspicious amendment patterns trigger moderation review

Suspicious patterns (examples):
- repeated amendments to entry/exit on closed positions
- amendments made long after close
- unusually high return% paired with frequent amendments

### 5.3 Minimum proof signals (optional)
- Encourage screenshots for credibility.
- Verified badges can exist in future.

---

## 6) Computation strategy (scale)
Leaderboards must be computed via rollups:
- hourly for short timeframes
- daily for longer

Rollups must be reproducible from the ledger.

---

## 7) Discovery

### 7.1 Discovery purpose
Help members find traders worth following.

### 7.2 Discovery filters
- markets (stocks/options)
- style tags (swing, trend, mean reversion, etc.)
- performance band (top 1%, top 10%, etc.)
- timeframe (30/60/90)
- activity (recent trades)

### 7.3 Discovery ranking (v1)
Rank candidates by:
1) leaderboard rank for chosen timeframe
2) recency (recent activity)
3) profile completeness

---

## 8) UX requirements
- Leaderboards show:
  - rank
  - username + bio
  - timeframe performance metrics
  - follow CTA
- Clicking a trader opens their public portfolio (member-only if required).
