-- Option legs for admin SSOT (`trading_positions`)
-- Supports up to 4 legs per position.

create table if not exists public.option_legs (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references public.trading_positions(id) on delete cascade,
  leg_order int not null check (leg_order >= 1 and leg_order <= 4),

  -- Option contract identity
  option_symbol text null,
  leg_type text null check (leg_type in ('call','put')),
  side text null check (side in ('buy','sell')),
  strike numeric null,
  expiration date null,

  -- Sizing
  contracts int not null default 1 check (contracts > 0),
  multiplier int not null default 100 check (multiplier > 0),

  -- Prices
  premium numeric null,
  filled_price numeric null,
  current_price numeric null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists option_legs_position_leg_order_ux
  on public.option_legs(position_id, leg_order);

create index if not exists option_legs_position_id_idx
  on public.option_legs(position_id);

create index if not exists option_legs_expiration_idx
  on public.option_legs(expiration);
