-- Tipy na appku (Profil + uvítací karta). Spusť v SQL Editoru jednou.
-- Čteš je ty: Table Editor → app_feedback. Uživatelé jen vkládají.

create table if not exists public.app_feedback (
  id text primary key,
  user_id text,
  user_name text,
  user_email text,
  kind text not null default 'tip',
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists app_feedback_created_at_idx
  on public.app_feedback (created_at desc);

alter table public.app_feedback enable row level security;

drop policy if exists "app_feedback_insert_auth" on public.app_feedback;

create policy "app_feedback_insert_auth" on public.app_feedback
  for insert to authenticated
  with check (
    user_id is null
    or user_id = auth.uid()::text
  );
