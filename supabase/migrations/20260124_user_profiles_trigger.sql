-- Ensure every auth user gets a corresponding public.user_profiles row.
--
-- IMPORTANT:
--  - Production already has a non-minimal `public.user_profiles` schema (e.g. NOT NULL username).
--  - Therefore we DO NOT create/alter the table shape here.
--  - We only ensure rows exist, providing safe defaults for required columns.

-- Helper: create a deterministic, valid username fallback.
-- Strategy: use email local-part when available, otherwise "user_<uuid8>".
-- Ensure uniqueness by suffixing with 6 chars of uuid when necessary.
CREATE OR REPLACE FUNCTION public._ssot_username_fallback(p_user_id uuid, p_email text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base text;
  candidate text;
BEGIN
  base := coalesce(nullif(split_part(coalesce(p_email, ''), '@', 1), ''), 'user_' || left(replace(p_user_id::text, '-', ''), 8));
  -- normalize: lower + replace non [a-z0-9_] with underscore
  base := lower(regexp_replace(base, '[^a-z0-9_]+', '_', 'g'));
  base := trim(both '_' from base);
  IF length(base) < 3 THEN
    base := 'user_' || left(replace(p_user_id::text, '-', ''), 8);
  END IF;

  candidate := base;
  IF EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.username = candidate) THEN
    candidate := base || '_' || right(replace(p_user_id::text, '-', ''), 6);
  END IF;
  RETURN candidate;
END;
$$;

-- Trigger function: insert profile row on auth.users insert.
-- We only set the columns we know are required: user_id + username.
-- If your table has additional NOT NULL columns, add them here.
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username text;
BEGIN
  v_username := public._ssot_username_fallback(NEW.id, NEW.email);

  INSERT INTO public.user_profiles (user_id, username, created_at, updated_at)
  VALUES (NEW.id, v_username, now(), now())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created_create_profile'
  ) THEN
    CREATE TRIGGER on_auth_user_created_create_profile
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE PROCEDURE public.handle_new_user_profile();
  END IF;
END$$;

-- Backfill existing users who are missing a profile.
-- This avoids FK failures for existing accounts too.
INSERT INTO public.user_profiles (user_id, username, created_at, updated_at)
SELECT
  u.id,
  public._ssot_username_fallback(u.id, u.email),
  now(),
  now()
FROM auth.users u
LEFT JOIN public.user_profiles up ON up.user_id = u.id
WHERE up.user_id IS NULL;
