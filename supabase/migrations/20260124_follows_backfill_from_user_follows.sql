-- Backfill legacy public.user_follows -> canonical public.follows
--
-- Context:
-- - Some routes historically wrote to `user_follows`.
-- - SSOT uses `follows` (see feed + auth callback).
-- - This migration copies data across so existing relationships continue to work.
--
-- This is written defensively because production schemas may drift.

DO $$
BEGIN
  -- Only run if both tables exist.
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='follows'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='user_follows'
  ) THEN

    -- Case A: user_follows uses follower_id/following_id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='user_follows' AND column_name='follower_id'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='user_follows' AND column_name='following_id'
    ) THEN
      INSERT INTO public.follows (follower_id, following_id, created_at)
      SELECT uf.follower_id, uf.following_id, COALESCE(uf.created_at, now())
      FROM public.user_follows uf
      WHERE uf.follower_id IS NOT NULL AND uf.following_id IS NOT NULL
      ON CONFLICT (follower_id, following_id) DO NOTHING;
    END IF;

    -- Case B: user_follows uses follower_user_id/following_user_id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='user_follows' AND column_name='follower_user_id'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='user_follows' AND column_name='following_user_id'
    ) THEN
      INSERT INTO public.follows (follower_id, following_id, created_at)
      SELECT uf.follower_user_id, uf.following_user_id, COALESCE(uf.created_at, now())
      FROM public.user_follows uf
      WHERE uf.follower_user_id IS NOT NULL AND uf.following_user_id IS NOT NULL
      ON CONFLICT (follower_id, following_id) DO NOTHING;
    END IF;
  END IF;
END$$;
