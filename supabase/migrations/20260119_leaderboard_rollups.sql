-- SSOT Phase 3: Leaderboard rollups (30/60/90)
-- Source of truth: docs/LEADERBOARD_DISCOVERY_SPEC.md
--
-- This table stores reproducible rollups derived from the canonical positions/ledger.

CREATE TABLE IF NOT EXISTS public.leaderboard_rollups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timeframe_days INT NOT NULL CHECK (timeframe_days IN (30, 60, 90)),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Primary metric
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  total_capital_at_risk NUMERIC NOT NULL DEFAULT 0,
  return_pct NUMERIC NOT NULL DEFAULT 0,

  -- Secondary metrics
  closed_positions INT NOT NULL DEFAULT 0,
  winning_positions INT NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  profit_factor NUMERIC,

  -- Integrity / eligibility
  has_public_portfolio BOOLEAN NOT NULL DEFAULT false,
  profile_complete BOOLEAN NOT NULL DEFAULT false,
  eligible BOOLEAN NOT NULL DEFAULT false,

  UNIQUE(user_id, timeframe_days)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_rollups_tf_rank ON public.leaderboard_rollups(timeframe_days, return_pct DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rollups_user ON public.leaderboard_rollups(user_id);

ALTER TABLE public.leaderboard_rollups ENABLE ROW LEVEL SECURITY;

-- Readable by authenticated users (API still enforces visibility/eligibility).
DROP POLICY IF EXISTS "Authenticated can read leaderboard rollups" ON public.leaderboard_rollups;
CREATE POLICY "Authenticated can read leaderboard rollups" ON public.leaderboard_rollups
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only service role should write rollups.
DROP POLICY IF EXISTS "Service role can write leaderboard rollups" ON public.leaderboard_rollups;
CREATE POLICY "Service role can write leaderboard rollups" ON public.leaderboard_rollups
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

