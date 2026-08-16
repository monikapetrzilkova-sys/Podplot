-- PodPlot — sdílené profily + příspěvky (MVP pro testery)
-- Spusť v Supabase Dashboard → SQL Editor → New query → Run

create table if not exists public.profiles (
  id text primary key,
  name text not null,
  email text,
  address text,
  account_type text,
  initials text,
  municipality text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  author_id text references public.profiles(id) on delete set null,
  author_name text not null,
  author_initials text,
  account_type text,
  title text not null,
  body text default '',
  type text,
  feed_type text default 'komunita',
  feed_subtype text,
  location_id text,
  municipality text,
  photos jsonb not null default '[]'::jsonb,
  map_pos jsonb,
  lat double precision,
  lng double precision,
  meta text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_municipality_idx on public.posts (municipality);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;

-- MVP: otevřené čtení/zápis pro anon klíč (pouze pro testování kamarády).
-- Později nahradit Supabase Auth + přísnější RLS.
drop policy if exists "profiles_select_public" on public.profiles;
drop policy if exists "profiles_insert_public" on public.profiles;
drop policy if exists "profiles_update_public" on public.profiles;
drop policy if exists "posts_select_public" on public.posts;
drop policy if exists "posts_insert_public" on public.posts;

create policy "profiles_select_public" on public.profiles for select using (true);
create policy "profiles_insert_public" on public.profiles for insert with check (true);
create policy "profiles_update_public" on public.profiles for update using (true) with check (true);

create policy "posts_select_public" on public.posts for select using (true);
create policy "posts_insert_public" on public.posts for insert with check (true);

-- Realtime (volitelné): Database → Replication → posts
-- nebo:
-- alter publication supabase_realtime add table public.posts;
