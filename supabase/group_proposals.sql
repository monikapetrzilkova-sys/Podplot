-- Návrhy skupin (spusť v Supabase SQL Editor, pokud už máš starší schema)
-- Po spuštění: Database → Publications → supabase_realtime → zapni group_proposals

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

-- Politiky: spusť supabase/rls_secure.sql
