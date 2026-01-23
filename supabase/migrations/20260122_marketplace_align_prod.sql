-- Marketplace alignment migration (production-safe)
--
-- Purpose:
--   Align an existing / drifted production schema to the Tier-1 SSOT marketplace schema
--   without destructive changes.
--
-- Why this file exists:
--   The SSOT migration `20260120_marketplace_core.sql` assumes a fresh schema.
--   Production may already have marketplace_* tables that are missing SSOT columns
--   (e.g. `marketplace_products.status`). This migration adds missing columns/tables/indexes
--   using forward-only, idempotent SQL.
--
-- Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Sellers: add missing SSOT columns
ALTER TABLE IF EXISTS public.marketplace_sellers
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS stripe_connect_onboarded boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS support_email text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_marketplace_sellers_user_id ON public.marketplace_sellers(user_id);

-- 2) Products: add missing SSOT columns
ALTER TABLE IF EXISTS public.marketplace_products
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS price_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id ON public.marketplace_products(seller_id);
-- Only create this index after ensuring the column exists (the issue that caused prod failure)
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON public.marketplace_products(status);

-- 3) Product versions (SSOT canonical)
CREATE TABLE IF NOT EXISTS public.marketplace_product_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  version text NOT NULL,
  changelog text,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, version)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_product_versions_product_id ON public.marketplace_product_versions(product_id);

-- 4) Orders (SSOT expects marketplace_orders, but production may already have a legacy version)
-- Add missing columns that SSOT app logic expects.
ALTER TABLE IF EXISTS public.marketplace_orders
  ADD COLUMN IF NOT EXISTS buyer_user_id uuid,
  ADD COLUMN IF NOT EXISTS product_id uuid,
  ADD COLUMN IF NOT EXISTS amount_cents integer,
  ADD COLUMN IF NOT EXISTS platform_fee_bps integer NOT NULL DEFAULT 2000,
  ADD COLUMN IF NOT EXISTS seller_net_cents integer,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- If production uses buyer_id/total_cents instead of SSOT, keep both.
-- (No destructive renames.)
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer ON public.marketplace_orders(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_product ON public.marketplace_orders(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_marketplace_orders_checkout_session ON public.marketplace_orders(stripe_checkout_session_id);

-- 5) Entitlements (SSOT canonical for "can download")
CREATE TABLE IF NOT EXISTS public.marketplace_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  granted_order_id uuid REFERENCES public.marketplace_orders(id) ON DELETE SET NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE(buyer_user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_entitlements_buyer ON public.marketplace_entitlements(buyer_user_id);

-- 6) Reviews (verified purchasers enforced in app)
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  buyer_user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, buyer_user_id)
);

-- 7) Reports / disputes
CREATE TABLE IF NOT EXISTS public.marketplace_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.marketplace_products(id) ON DELETE SET NULL,
  reporter_user_id uuid,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8) Webhook audit log + idempotency (SSOT)
CREATE TABLE IF NOT EXISTS public.marketplace_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'stripe',
  event_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, event_id)
);

