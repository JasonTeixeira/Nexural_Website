-- SSOT Phase 2: Alert preferences
-- Source of truth: docs/FEED_ALERTS_SPEC.md
--
-- Defaults:
-- - Admin alerts: ON recommendation (user can opt out)
-- - Member alerts: OFF by default (user opts in per followed trader)
-- - Admin amendment alerts: default OFF (future)

CREATE TABLE IF NOT EXISTS public.alert_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_trade_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  admin_amendment_alerts_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their alert preferences" ON public.alert_preferences;
CREATE POLICY "Users can read their alert preferences" ON public.alert_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert their alert preferences" ON public.alert_preferences;
CREATE POLICY "Users can upsert their alert preferences" ON public.alert_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

