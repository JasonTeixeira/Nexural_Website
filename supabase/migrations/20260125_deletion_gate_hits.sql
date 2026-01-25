-- SSOT deletion-gate telemetry sink (DB-backed)
--
-- Why: Vercel “request logs” may not expose function stdout reliably.
-- We store deletion-gate hits in Postgres so we can query traffic=0 windows
-- deterministically.

create table if not exists public.deletion_gate_hits (
  id uuid primary key default gen_random_uuid(),
  tag text not null,
  meta jsonb,
  request_id text,
  created_at timestamptz not null default now()
);

create index if not exists deletion_gate_hits_tag_created_at_idx
  on public.deletion_gate_hits (tag, created_at desc);

create index if not exists deletion_gate_hits_created_at_idx
  on public.deletion_gate_hits (created_at desc);

-- RLS: only service role (server) should write/read.
alter table public.deletion_gate_hits enable row level security;

-- Deny by default for authenticated/anon.
drop policy if exists "deny all" on public.deletion_gate_hits;
create policy "deny all" on public.deletion_gate_hits
  for all
  to public
  using (false)
  with check (false);
