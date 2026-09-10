-- Síť důvěry: potvrzení sousedství + realtime nových profilů
-- Spusť v Supabase → SQL Editor (jednou), když už máš profiles z schema.sql

create table if not exists public.neighbor_confirmations (
  confirmer_id text not null,
  neighbor_id text not null,
  created_at timestamptz not null default now(),
  primary key (confirmer_id, neighbor_id)
);

create index if not exists neighbor_confirmations_neighbor_idx
  on public.neighbor_confirmations (neighbor_id);

alter table public.neighbor_confirmations enable row level security;

-- Politiky: spusť supabase/rls_secure.sql

-- Realtime: Database → Publications → supabase_realtime → zapni
--   profiles
--   neighbor_confirmations
-- nebo:
-- alter publication supabase_realtime add table public.profiles;
-- alter publication supabase_realtime add table public.neighbor_confirmations;
