-- Supabase schema for Pastorais e Movimentos
-- Run this in the Supabase SQL Editor.

-- Single-row JSON payload store (same pattern as site_data)
create table if not exists public.pastorais_data (
  id text primary key default 'singleton',
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.pastorais_data enable row level security;

-- Public read access (frontend fetches without auth)
create policy "public read pastorais_data" on public.pastorais_data
  for select using (true);

-- Service role / anon write access (backend uses service role key)
create policy "service write pastorais_data" on public.pastorais_data
  for all using (auth.role() = 'service_role' or auth.role() = 'anon');
