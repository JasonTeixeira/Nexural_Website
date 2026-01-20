# Domain Model — Canonical Entities (SSOT)

This document defines the **canonical nouns** of the platform and how they relate.
It is architecture-level (no implementation details).

## 1) Identity & Profiles
### User
- A person who can sign in.
- Has an email identity.

### Profile
- Public-facing metadata for a user: username, bio, avatar, tags.

### Portfolio Visibility
- Global setting per user:
  - **Public**: all positions visible.
  - **Private**: no positions visible.

### Admin Role
- A user with operational privileges.
- RBAC levels (example): owner/support.

## 2) Trading Ledger (Core)
### Position
Represents a single trade/investment idea with a lifecycle.

Key attributes:
- `owner_id` (user id)
- `owner_type`: admin | member
- `asset_type`: stock | option
- `symbol` (underlying)
- `status`: open | closed
- timestamps: opened_at, closed_at
- size fields (hidden in public teaser for admin)

### Position Leg (Options)
Represents an option leg.

Rules:
- Up to **4 legs** supported.
- Supports:
  - single-leg calls/puts
  - vertical spreads
  - iron condors

Key attributes:
- call/put
- strike
- expiry
- contracts
- premium
- side (buy/sell)

### Position Event
Immutable record describing what happened.

Events power:
- feed items
- alerts/notifications
- audit history
- leaderboard rollups (indirectly)

Event types (high level):
- opened
- closed
- amended (any edit; includes diff summary)
- stop_set / target_set
- image_added
- comment_added

### Journal Entry
Structured reflections tied to a position.

Components:
- thesis
- emotions
- checklist
- screenshots
- playbook tags

### Import Job
Represents a CSV import session.
- All imported positions/events reference an import job.
- Imported/backfilled data is flagged.

## 3) Social Graph & Engagement
### Follow
Relationship: user A follows user B.

### Social Post (optional)
Standalone posts that are not tied to a position.

### Comment
Comments can target:
- a position
- a post

### Like/Reaction
Lightweight engagement on posts/comments.

### Direct Message
1:1 communication.

## 4) Feed & Notifications
### Feed Item
Represents something shown in a feed.
Derived from position events and/or posts.

### Notification
Represents an alert delivered to a user.

Notification triggers (v1 recommended):
- position opened
- position closed
- stop hit
- target hit

## 5) Leaderboards & Discovery
### Performance Snapshot
Derived metrics for a user’s public portfolio over a time range.

### Leaderboard Entry
Ranked view of performance snapshots by timeframe.

### Discovery Profile
Queryable profile metadata:
- style tags
- markets
- performance bands

## 6) Growth Engine
### Newsletter Subscriber
Email identity (may or may not be a member).

### Referral Code
Code tied to a member.

### Referral Event
Attribution of signup to code.

### Points Ledger
Immutable points transactions (earn/burn).

## 7) Marketplace
### Seller
Member who can sell products.

### Product
Digital artifact listing.

### License / Purchase
Proof of entitlement to download.

