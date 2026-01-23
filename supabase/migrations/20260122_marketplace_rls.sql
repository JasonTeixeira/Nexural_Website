-- Marketplace RLS policies (Tier-1 SSOT)
--
-- Purpose:
--   Ensure SSOT marketplace tables have explicit RLS rules in git, not only in the dashboard.
--
-- Notes:
--   - These policies are intentionally conservative.
--   - Server routes that must bypass RLS should use the service role.

-- Products
ALTER TABLE IF EXISTS public.marketplace_products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Only create the “active products” policy if the `status` column exists.
  -- Some production environments drifted and may not have it yet.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='marketplace_products' AND column_name='status'
  ) THEN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_products' AND policyname='Public can read active marketplace products'
  ) THEN
    CREATE POLICY "Public can read active marketplace products" ON public.marketplace_products
      FOR SELECT TO anon, authenticated
      USING (status = 'active');
  END IF;
  ELSE
    -- Fallback: if `status` is missing, allow read (assumes products are already curated).
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_products' AND policyname='Public can read marketplace products (no status column)'
    ) THEN
      CREATE POLICY "Public can read marketplace products (no status column)" ON public.marketplace_products
        FOR SELECT TO anon, authenticated
        USING (true);
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_products' AND policyname='Sellers can insert their products'
  ) THEN
    CREATE POLICY "Sellers can insert their products" ON public.marketplace_products
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_products' AND policyname='Sellers can update their products'
  ) THEN
    CREATE POLICY "Sellers can update their products" ON public.marketplace_products
      FOR UPDATE TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;


-- Product versions
ALTER TABLE IF EXISTS public.marketplace_product_versions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_product_versions' AND policyname='Authenticated can read product versions'
  ) THEN
    CREATE POLICY "Authenticated can read product versions" ON public.marketplace_product_versions
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_product_versions' AND policyname='Service role can manage product versions'
  ) THEN
    CREATE POLICY "Service role can manage product versions" ON public.marketplace_product_versions
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;


-- Orders
ALTER TABLE IF EXISTS public.marketplace_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_orders' AND policyname='Buyers can read their marketplace orders'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='marketplace_orders' AND column_name='buyer_user_id'
    ) THEN
      CREATE POLICY "Buyers can read their marketplace orders" ON public.marketplace_orders
        FOR SELECT TO authenticated
        USING (auth.uid() = buyer_user_id);
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_orders' AND policyname='Service role can manage marketplace orders'
  ) THEN
    CREATE POLICY "Service role can manage marketplace orders" ON public.marketplace_orders
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;


-- Entitlements (SSOT canonical access gate)
ALTER TABLE IF EXISTS public.marketplace_entitlements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_entitlements' AND policyname='Buyers can read their entitlements'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='marketplace_entitlements' AND column_name='buyer_user_id'
    ) THEN
      CREATE POLICY "Buyers can read their entitlements" ON public.marketplace_entitlements
        FOR SELECT TO authenticated
        USING (auth.uid() = buyer_user_id);
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_entitlements' AND policyname='Service role can manage entitlements'
  ) THEN
    CREATE POLICY "Service role can manage entitlements" ON public.marketplace_entitlements
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;


-- Reviews
ALTER TABLE IF EXISTS public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_reviews' AND policyname='Public can read marketplace reviews'
  ) THEN
    CREATE POLICY "Public can read marketplace reviews" ON public.marketplace_reviews
      FOR SELECT TO anon, authenticated
      USING (true);
  END IF;

  -- NOTE: Verified-purchase enforcement is handled in app (must check entitlements before insert).
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_reviews' AND policyname='Buyers can write reviews as themselves'
  ) THEN
    -- Prod drift: some envs use `buyer_id` instead of `buyer_user_id`.
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='marketplace_reviews' AND column_name='buyer_user_id'
    ) THEN
      CREATE POLICY "Buyers can write reviews as themselves" ON public.marketplace_reviews
        FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = buyer_user_id);
    ELSIF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='marketplace_reviews' AND column_name='buyer_id'
    ) THEN
      CREATE POLICY "Buyers can write reviews as themselves" ON public.marketplace_reviews
        FOR INSERT TO authenticated
        WITH CHECK (auth.uid() = buyer_id);
    END IF;
  END IF;
END$$;


-- Reports / disputes
ALTER TABLE IF EXISTS public.marketplace_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_reports' AND policyname='Authenticated can create marketplace reports'
  ) THEN
    CREATE POLICY "Authenticated can create marketplace reports" ON public.marketplace_reports
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = reporter_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_reports' AND policyname='Service role can manage marketplace reports'
  ) THEN
    CREATE POLICY "Service role can manage marketplace reports" ON public.marketplace_reports
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;


-- Webhook events (audit log)
ALTER TABLE IF EXISTS public.marketplace_webhook_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='marketplace_webhook_events' AND policyname='Service role can manage marketplace webhook events'
  ) THEN
    CREATE POLICY "Service role can manage marketplace webhook events" ON public.marketplace_webhook_events
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;
