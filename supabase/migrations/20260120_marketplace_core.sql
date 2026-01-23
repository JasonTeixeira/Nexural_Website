-- Marketplace (Tier-1 SSOT)
-- Source of truth: docs/MARKETPLACE_SPEC.md
-- Notes:
-- - Keep schema intentionally minimal but extensible.
-- - Use UUIDs everywhere.
-- - Purchases are confirmed via Stripe webhooks; orders are idempotent.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Sellers
CREATE TABLE IF NOT EXISTS public.marketplace_sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text NOT NULL,
  bio text,
  support_email text,
  stripe_connect_account_id text,
  stripe_connect_onboarded boolean NOT NULL DEFAULT false,
  terms_accepted_at timestamptz,
  status text NOT NULL DEFAULT 'active', -- active|suspended
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_sellers_user_id ON public.marketplace_sellers(user_id);

-- 2) Products
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.marketplace_sellers(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  type text NOT NULL, -- indicator|code|system|other
  title text NOT NULL,
  description text NOT NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active', -- active|removed
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id ON public.marketplace_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON public.marketplace_products(status);

-- 3) Product versions
CREATE TABLE IF NOT EXISTS public.marketplace_product_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  version text NOT NULL,
  changelog text,
  storage_path text NOT NULL, -- Supabase Storage object path
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, version)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_product_versions_product_id ON public.marketplace_product_versions(product_id);

-- 4) Orders (purchases)
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.marketplace_products(id) ON DELETE RESTRICT,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  platform_fee_bps integer NOT NULL DEFAULT 2000, -- 20% = 2000 bps
  platform_fee_cents integer NOT NULL,
  seller_net_cents integer NOT NULL,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  status text NOT NULL DEFAULT 'pending', -- pending|paid|canceled|refunded
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer ON public.marketplace_orders(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_product ON public.marketplace_orders(product_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_marketplace_orders_checkout_session ON public.marketplace_orders(stripe_checkout_session_id);

-- 5) Entitlements (licenses)
CREATE TABLE IF NOT EXISTS public.marketplace_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  granted_order_id uuid REFERENCES public.marketplace_orders(id) ON DELETE SET NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active', -- active|revoked
  UNIQUE(buyer_user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_entitlements_buyer ON public.marketplace_entitlements(buyer_user_id);

-- 6) Reviews (verified purchasers only; enforced in app logic)
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
  status text NOT NULL DEFAULT 'open', -- open|resolved|dismissed
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8) Webhook audit log + idempotency
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

