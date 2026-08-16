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
  profile_photo text,
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

-- ---------------------------------------------------------------------------
-- Přímé zprávy mezi testery (odpověď na inzerát / hlášení)
-- Spusť i tento blok, pokud už máš profiles/posts z dřívějška.
-- ---------------------------------------------------------------------------

create table if not exists public.direct_messages (
  id text primary key,
  conversation_id text not null,
  sender_id text not null,
  sender_name text not null,
  recipient_id text not null,
  recipient_name text,
  body text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists direct_messages_recipient_idx
  on public.direct_messages (recipient_id, created_at desc);
create index if not exists direct_messages_sender_idx
  on public.direct_messages (sender_id, created_at desc);
create index if not exists direct_messages_conversation_idx
  on public.direct_messages (conversation_id, created_at);

alter table public.direct_messages enable row level security;

drop policy if exists "direct_messages_select_public" on public.direct_messages;
drop policy if exists "direct_messages_insert_public" on public.direct_messages;
drop policy if exists "direct_messages_update_public" on public.direct_messages;

create policy "direct_messages_select_public" on public.direct_messages for select using (true);
create policy "direct_messages_insert_public" on public.direct_messages for insert with check (true);
create policy "direct_messages_update_public" on public.direct_messages for update using (true) with check (true);

-- Realtime: Database → Publications → supabase_realtime → zapni direct_messages
-- nebo:
-- alter publication supabase_realtime add table public.direct_messages;

-- ---------------------------------------------------------------------------
-- Síť důvěry: potvrzení sousedství (viz také supabase/trust.sql)
-- Realtime: zapni i tabulku profiles
-- ---------------------------------------------------------------------------

create table if not exists public.neighbor_confirmations (
  confirmer_id text not null,
  neighbor_id text not null,
  created_at timestamptz not null default now(),
  primary key (confirmer_id, neighbor_id)
);

-- Existující DB: doplnění fotky profilu (bezpečné spustit opakovaně)
alter table public.profiles add column if not exists profile_photo text;

create index if not exists neighbor_confirmations_neighbor_idx
  on public.neighbor_confirmations (neighbor_id);

alter table public.neighbor_confirmations enable row level security;

drop policy if exists "neighbor_confirmations_select_public" on public.neighbor_confirmations;
drop policy if exists "neighbor_confirmations_insert_public" on public.neighbor_confirmations;

-- Realtime: Database → Publications → supabase_realtime → zapni neighbor_confirmations
-- nebo:
-- alter publication supabase_realtime add table public.neighbor_confirmations;

-- ---------------------------------------------------------------------------
-- Návrhy nových skupin (hlasování sousedů — Domů + Skupiny)
-- ---------------------------------------------------------------------------

create table if not exists public.group_proposals (
  id text primary key,
  name text not null,
  description text default '',
  purpose text default '',
  club_category text,
  tag text,
  votes integer not null default 1,
  required integer not null default 5,
  proposer_id text,
  proposer_name text,
  municipality text,
  status text not null default 'v-priprave',
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists group_proposals_municipality_idx
  on public.group_proposals (municipality);
create index if not exists group_proposals_created_at_idx
  on public.group_proposals (created_at desc);

create table if not exists public.group_proposal_votes (
  proposal_id text not null references public.group_proposals(id) on delete cascade,
  voter_id text not null,
  created_at timestamptz not null default now(),
  primary key (proposal_id, voter_id)
);

alter table public.group_proposals enable row level security;
alter table public.group_proposal_votes enable row level security;

drop policy if exists "group_proposals_select_public" on public.group_proposals;
drop policy if exists "group_proposals_insert_public" on public.group_proposals;
drop policy if exists "group_proposals_update_public" on public.group_proposals;
drop policy if exists "group_proposal_votes_select_public" on public.group_proposal_votes;
drop policy if exists "group_proposal_votes_insert_public" on public.group_proposal_votes;

create policy "group_proposals_select_public" on public.group_proposals for select using (true);
create policy "group_proposals_insert_public" on public.group_proposals for insert with check (true);
create policy "group_proposals_update_public" on public.group_proposals for update using (true) with check (true);
create policy "group_proposal_votes_select_public" on public.group_proposal_votes for select using (true);
create policy "group_proposal_votes_insert_public" on public.group_proposal_votes for insert with check (true);

-- Realtime: zapni group_proposals (+ volitelně group_proposal_votes)
-- alter publication supabase_realtime add table public.group_proposals;
