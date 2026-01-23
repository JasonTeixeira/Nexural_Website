-- Newsletter core schema + RLS (Tier-1 SSOT)
--
-- Purpose:
--   Ensure canonical newsletter tables exist in migrations (SSOT), not only as
--   ad-hoc/dashboard schema.
--
-- This migration defines:
--   - newsletter_subscribers
--   - newsletter_campaigns
--   - newsletter_sends (idempotency constraint is added in 20260120_newsletter_send_idempotency.sql)
--   - newsletter_clicks
--
-- Notes:
--   - Conservative RLS: subscribers can only read/update their own row.
--   - Admin/service role does campaign management and send logging.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Subscribers
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'active', -- active|unsubscribed
  tags text[] NOT NULL DEFAULT '{}',
  source text,
  is_member boolean NOT NULL DEFAULT false,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_user_id ON public.newsletter_subscribers(user_id);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='newsletter_subscribers' AND policyname='Service role can manage newsletter subscribers'
  ) THEN
    CREATE POLICY "Service role can manage newsletter subscribers" ON public.newsletter_subscribers
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='newsletter_subscribers' AND policyname='Authenticated can read their subscriber row'
  ) THEN
    -- Only create this policy if the `user_id` column exists.
    -- Some prod environments have a legacy newsletter_subscribers table without user linkage.
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='newsletter_subscribers' AND column_name='user_id'
    ) THEN
      CREATE POLICY "Authenticated can read their subscriber row" ON public.newsletter_subscribers
        FOR SELECT TO authenticated
        USING (auth.uid() = user_id);
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='newsletter_subscribers' AND policyname='Authenticated can update their subscriber row'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='newsletter_subscribers' AND column_name='user_id'
    ) THEN
      CREATE POLICY "Authenticated can update their subscriber row" ON public.newsletter_subscribers
        FOR UPDATE TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
  END IF;
END$$;


-- 2) Campaigns
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body_html text,
  status text NOT NULL DEFAULT 'draft', -- draft|scheduled|sending|sent
  scheduled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='newsletter_campaigns' AND policyname='Service role can manage newsletter campaigns'
  ) THEN
    CREATE POLICY "Service role can manage newsletter campaigns" ON public.newsletter_campaigns
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;


-- 3) Sends (delivery log)
CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id uuid REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'resend',
  provider_message_id text,
  status text NOT NULL DEFAULT 'queued', -- queued|sent|failed
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_sends_campaign_id ON public.newsletter_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_subscriber_id ON public.newsletter_sends(subscriber_id);

ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='newsletter_sends' AND policyname='Service role can manage newsletter sends'
  ) THEN
    CREATE POLICY "Service role can manage newsletter sends" ON public.newsletter_sends
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;


-- 4) Click tracking
CREATE TABLE IF NOT EXISTS public.newsletter_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id uuid REFERENCES public.newsletter_sends(id) ON DELETE SET NULL,
  subscriber_id uuid REFERENCES public.newsletter_subscribers(id) ON DELETE SET NULL,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_clicks_send_id ON public.newsletter_clicks(send_id);

ALTER TABLE public.newsletter_clicks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='newsletter_clicks' AND policyname='Service role can manage newsletter clicks'
  ) THEN
    CREATE POLICY "Service role can manage newsletter clicks" ON public.newsletter_clicks
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;
