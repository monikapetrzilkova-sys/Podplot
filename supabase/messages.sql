-- Jen přímé zprávy (když už máš profiles + posts)
-- Supabase → SQL Editor → Run

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
-- Politiky: spusť supabase/rls_secure.sql

-- Volitelně Realtime: Database → Publications → zapni tabulku direct_messages
