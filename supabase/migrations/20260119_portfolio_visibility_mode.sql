-- SSOT Phase 4A: Global member portfolio visibility mode
-- Source of truth: docs/PERMISSIONS_PRIVACY.md §5
--
-- Members choose ONE global mode:
-- - public: all portfolios/positions visible to other members (subject to eligibility)
-- - private: no portfolios/positions visible (except owner)
--
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS portfolio_visibility_mode TEXT NOT NULL DEFAULT 'public'
  CHECK (portfolio_visibility_mode IN ('public', 'private'));

CREATE INDEX IF NOT EXISTS idx_user_profiles_portfolio_visibility_mode
  ON public.user_profiles(portfolio_visibility_mode);

