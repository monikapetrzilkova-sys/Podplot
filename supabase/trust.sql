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

drop policy if exists "neighbor_confirmations_select_public" on public.neighbor_confirmations;
drop policy if exists "neighbor_confirmations_insert_public" on public.neighbor_confirmations;

create policy "neighbor_confirmations_select_public"
  on public.neighbor_confirmations for select using (true);
create policy "neighbor_confirmations_insert_public"
  on public.neighbor_confirmations for insert with check (true);

-- Realtime: Database → Publications → supabase_realtime → zapni
--   profiles
--   neighbor_confirmations (volitelné)
-- nebo:
-- alter publication supabase_realtime add table public.profiles;
