# Trading Ledger Spec (Tier‑1 SSOT)

This document defines the canonical **trade tracking ledger** for Nexural.

It is the foundation for:
- admin trade transparency
- member trade tracking + journaling
- feed + alerts
- analytics and leaderboards

---

## 1) Core principle
There is **one** canonical ledger for positions.

- Admin trades and member trades are the same object type.
- The difference is ownership (`owner_type = admin|member`) and visibility rules.

---

## 2) Supported instruments (v1)
### 2.1 Stocks
- Long/short supported.

### 2.2 Options
- Single-leg calls/puts.
- Multi-leg spreads up to **4 legs** (supports verticals + iron condors).

---

## 3) Canonical entities
### 3.1 Position
Represents a single trade/investment idea over time.

Minimum required fields:
- owner_id
- owner_type: admin|member
- asset_type: stock|option
- underlying_symbol
- opened_at (timestamp)
- entry reference values (enough to compute P&L)
- status: open|closed

Additional required (to remove ambiguity):
- `direction`: long|short (stocks) and/or net exposure summary (options)
- `currency`: default USD

Optional fields:
- thesis
- tags
- stop/targets
- notes

### 3.2 Position Legs (options)
Rules:
- 0 legs for stock positions.
- 1–4 legs for option positions.

Each leg must define:
- type: call|put
- side: buy|sell
- strike
- expiry
- contracts
- entry premium (and exit premium if closed)

Additional required (to remove ambiguity):
- `multiplier`: default 100
- `underlying_symbol` must match the parent position

### 3.3 Position Events (audit spine)
Every lifecycle change emits an event.
Events are append-only.

Required lifecycle events:
- `position.opened`
- `position.closed`

Required integrity event:
- `position.amended` for any edit that changes economic truth.

---

## 4) Public teaser vs member full views

### 4.1 Public teaser rule (admin trades)
Public can see admin trades but **must not see**:
- entry price
- sizing (shares/contracts)
- any derived fields that allow inference

Public teaser may include:
- symbol + direction
- timestamps (opened/closed)
- high-level tags / category
- optional outcome band (win/loss) without exact values

### 4.2 Member full view
Members can see full details:
- entry/exit
- sizes
- legs
- thesis/notes
- event history

---

## 5) Edit history (amendments)
Edits are allowed.

### 5.1 Amendment requirements
Any edit that changes one of these must emit `position.amended`:
- entry/exit price
- timestamps
- contracts/shares
- legs (strike/expiry/call-put/buy-sell)
- status

Edits that do **not** change economic truth (still logged, but may be treated as “minor”):
- thesis text
- tags
- notes formatting

The amendment must include:
- who edited
- when
- what changed (diff summary)
- why (optional note)

### 5.2 UI requirement
Every position shows an “Edit history” section that lists amendments.

---

## 6) Backfill + import rules

### 6.1 Allowed
- Backfilled trades are allowed.

### 6.2 Required flags
Backfilled/imported positions must be flagged as:
- `source = manual | import | backfill`

### 6.3 Leaderboard inclusion policy (v1 default)
- Backfilled positions are allowed but must be flagged.
- Default hardening: exclude backfilled positions from leaderboard until aged **14 days**.

---

## 7) Performance calculations (v1)
Leaderboards and analytics are **positions-derived**.

### 7.1 Stocks
Realized P&L (closed):
- `(exit_price - entry_price) * shares` for longs
- `(entry_price - exit_price) * shares` for shorts

Unrealized P&L (open):
- `(current_price - entry_price) * shares` for longs
- `(entry_price - current_price) * shares` for shorts

### 7.2 Options
Per-leg P&L uses premium deltas:
- Buy to open: `(exit_premium - entry_premium) * contracts * multiplier`
- Sell to open: `(entry_premium - exit_premium) * contracts * multiplier`

Assumptions:
- Contract multiplier default: 100
- Fees/commissions ignored in v1 or optional fields.

### 7.4 Corporate actions / symbol changes
v1 policy:
- ignore corporate actions adjustments (splits/dividends) unless manually amended by admin.
- any adjustment must emit `position.amended`.

### 7.3 Portfolio performance
Timeframe performance is computed from positions in that window.

---

## 8) Required outputs for downstream systems
The ledger must support:
- Feed generation from events
- Alerts from core events
- Analytics rollups
- Leaderboard rollups by timeframe
