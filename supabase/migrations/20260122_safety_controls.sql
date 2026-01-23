-- Safety controls (Tier-1 SSOT)
--
-- Source: docs/PERMISSIONS_PRIVACY.md (block/mute/report are first-class behaviors)
--
-- Adds:
--   - user_blocks: hard block (prevents follow/message/interactions; feed must hide)
--   - user_mutes: soft hide (optional; feed hide but allow follow)
--   - user_reports: report for moderation

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Blocks
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_user_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blocker_user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_user_id);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_blocks' AND policyname='Users can read their blocks'
  ) THEN
    CREATE POLICY "Users can read their blocks" ON public.user_blocks
      FOR SELECT TO authenticated
      USING (auth.uid() = blocker_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_blocks' AND policyname='Users can create blocks'
  ) THEN
    CREATE POLICY "Users can create blocks" ON public.user_blocks
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = blocker_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_blocks' AND policyname='Users can delete their blocks'
  ) THEN
    CREATE POLICY "Users can delete their blocks" ON public.user_blocks
      FOR DELETE TO authenticated
      USING (auth.uid() = blocker_user_id);
  END IF;
END$$;


-- 2) Mutes (optional)
CREATE TABLE IF NOT EXISTS public.user_mutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  muter_user_id uuid NOT NULL,
  muted_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(muter_user_id, muted_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_mutes_muter ON public.user_mutes(muter_user_id);
CREATE INDEX IF NOT EXISTS idx_user_mutes_muted ON public.user_mutes(muted_user_id);

ALTER TABLE public.user_mutes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_mutes' AND policyname='Users can read their mutes'
  ) THEN
    CREATE POLICY "Users can read their mutes" ON public.user_mutes
      FOR SELECT TO authenticated
      USING (auth.uid() = muter_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_mutes' AND policyname='Users can create mutes'
  ) THEN
    CREATE POLICY "Users can create mutes" ON public.user_mutes
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = muter_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_mutes' AND policyname='Users can delete their mutes'
  ) THEN
    CREATE POLICY "Users can delete their mutes" ON public.user_mutes
      FOR DELETE TO authenticated
      USING (auth.uid() = muter_user_id);
  END IF;
END$$;


-- 3) Reports
CREATE TABLE IF NOT EXISTS public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL,
  reported_user_id uuid,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON public.user_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON public.user_reports(reported_user_id);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_reports' AND policyname='Users can create reports'
  ) THEN
    CREATE POLICY "Users can create reports" ON public.user_reports
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = reporter_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_reports' AND policyname='Users can read their reports'
  ) THEN
    CREATE POLICY "Users can read their reports" ON public.user_reports
      FOR SELECT TO authenticated
      USING (auth.uid() = reporter_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_reports' AND policyname='Service role can manage user reports'
  ) THEN
    CREATE POLICY "Service role can manage user reports" ON public.user_reports
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;

