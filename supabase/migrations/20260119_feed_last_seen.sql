-- SSOT Phase 2: "Since last visit" feed cursor
-- Source of truth: docs/FEED_ALERTS_SPEC.md

CREATE TABLE IF NOT EXISTS public.feed_last_seen (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_last_seen_updated_at ON public.feed_last_seen(updated_at DESC);

ALTER TABLE public.feed_last_seen ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own cursor.
DROP POLICY IF EXISTS "User can read their feed cursor" ON public.feed_last_seen;
CREATE POLICY "User can read their feed cursor" ON public.feed_last_seen
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can upsert their feed cursor" ON public.feed_last_seen;
CREATE POLICY "User can upsert their feed cursor" ON public.feed_last_seen
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can update their feed cursor" ON public.feed_last_seen;
CREATE POLICY "User can update their feed cursor" ON public.feed_last_seen
  FOR UPDATE USING (auth.uid() = user_id);

