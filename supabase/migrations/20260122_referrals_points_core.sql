-- Referrals & Points core schema + RLS (Tier-1 SSOT)
--
-- Purpose:
--   Add canonical referrals + points ledger tables that are referenced by the app code
--   and required by `docs/REFERRALS_POINTS_SPEC.md`.
--
-- Notes:
--   - Forward-only, production-safe, idempotent where possible.
--   - Uses RLS so members can only read their own records.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Referral codes
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(code),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Members can read their own referral code; public does not need table access.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_codes' AND policyname='Users can read their referral code'
  ) THEN
    CREATE POLICY "Users can read their referral code" ON public.referral_codes
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_codes' AND policyname='Users can upsert their referral code'
  ) THEN
    CREATE POLICY "Users can upsert their referral code" ON public.referral_codes
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_codes' AND policyname='Users can update their referral code'
  ) THEN
    CREATE POLICY "Users can update their referral code" ON public.referral_codes
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;


-- 2) Referral events (attribution)
CREATE TABLE IF NOT EXISTS public.referral_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id uuid REFERENCES public.referral_codes(id) ON DELETE SET NULL,
  referrer_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  attribution_type text NOT NULL DEFAULT 'first_touch',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON public.referral_events(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referred ON public.referral_events(referred_user_id);

ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_events' AND policyname='Users can read referral events involving them'
  ) THEN
    CREATE POLICY "Users can read referral events involving them" ON public.referral_events
      FOR SELECT TO authenticated
      USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);
  END IF;

  -- Writes are performed by the service role (cron) or trusted server routes.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='referral_events' AND policyname='Service role can write referral events'
  ) THEN
    CREATE POLICY "Service role can write referral events" ON public.referral_events
      FOR INSERT TO service_role
      WITH CHECK (true);
  END IF;
END$$;


-- 3) Points ledger (immutable)
CREATE TABLE IF NOT EXISTS public.points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL, -- earn|burn|adjustment
  source text NOT NULL, -- referral_signup|milestone|admin_adjustment
  points integer NOT NULL,
  ref_event_id uuid REFERENCES public.referral_events(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_points_ledger_user_id ON public.points_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_points_ledger_ref_event_id ON public.points_ledger(ref_event_id);

ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='points_ledger' AND policyname='Users can read own points ledger'
  ) THEN
    CREATE POLICY "Users can read own points ledger" ON public.points_ledger
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='points_ledger' AND policyname='Service role can write points ledger'
  ) THEN
    CREATE POLICY "Service role can write points ledger" ON public.points_ledger
      FOR INSERT TO service_role
      WITH CHECK (true);
  END IF;
END$$;


-- 4) Points balances (derived)
CREATE TABLE IF NOT EXISTS public.points_balances (
  user_id uuid PRIMARY KEY,
  balance integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.points_balances ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='points_balances' AND policyname='Users can read own points balance'
  ) THEN
    CREATE POLICY "Users can read own points balance" ON public.points_balances
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='points_balances' AND policyname='Service role can upsert points balances'
  ) THEN
    CREATE POLICY "Service role can upsert points balances" ON public.points_balances
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;

