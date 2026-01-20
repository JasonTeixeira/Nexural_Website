-- SSOT Phase 3: Backfill/import flags for leaderboard integrity
-- Source of truth: docs/LEADERBOARD_DISCOVERY_SPEC.md

ALTER TABLE public.positions
  ADD COLUMN IF NOT EXISTS source_system TEXT,
  ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_backfilled BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_positions_is_backfilled ON public.positions(is_backfilled);
CREATE INDEX IF NOT EXISTS idx_positions_imported_at ON public.positions(imported_at);

