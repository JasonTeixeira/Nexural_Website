-- SSOT Phase 3: mark leaderboard rollups as approximate when snapshots are missing
-- Source of truth: docs/LEADERBOARD_DISCOVERY_SPEC.md

ALTER TABLE public.leaderboard_rollups
  ADD COLUMN IF NOT EXISTS approximate BOOLEAN NOT NULL DEFAULT true;

