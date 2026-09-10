-- PodPlot — zabezpečení RLS (spusť v Supabase → SQL Editor → Run)
-- Po spuštění: anon klíč už nestačí k čtení/zápisu. Přístup mají jen přihlášení
-- uživatelé, a jen k tomu, co jim patří (zprávy, vlastní příspěvky, vlastní profil).
--
-- Chybějící tabulky (např. neighbor_confirmations) se přeskočí — skript nespadne.
-- Když tabulku doplníš (trust.sql / messages.sql / group_proposals.sql), spusť
-- tenhle soubor znovu.
--
-- Table editor v Dashboardu (ty jako vlastník projektu) dál vidíš všechno.
-- service_role klíč NESmíš dávat do aplikace ani na Vercel.

create or replace function public.current_uid()
returns text
language sql
stable
as $$
  select auth.uid()::text;
$$;

revoke all on function public.current_uid() from public;
grant execute on function public.current_uid() to authenticated;

create or replace function public._pp_drop_policies(p_table text, p_names text[])
returns void
language plpgsql
as $$
declare
  pol text;
begin
  if to_regclass('public.' || p_table) is null then
    return;
  end if;
  foreach pol in array p_names loop
    execute format('drop policy if exists %I on public.%I', pol, p_table);
  end loop;
end;
$$;

do $$
begin
  perform public._pp_drop_policies('profiles', array[
    'profiles_select_public',
    'profiles_insert_public',
    'profiles_update_public',
    'profiles_select_auth',
    'profiles_insert_own',
    'profiles_update_own',
    'profiles_delete_own'
  ]);
  perform public._pp_drop_policies('posts', array[
    'posts_select_public',
    'posts_insert_public',
    'posts_update_public',
    'posts_select_auth',
    'posts_insert_own',
    'posts_update_own',
    'posts_delete_own'
  ]);
  perform public._pp_drop_policies('direct_messages', array[
    'direct_messages_select_public',
    'direct_messages_insert_public',
    'direct_messages_update_public',
    'direct_messages_select_own',
    'direct_messages_insert_own',
    'direct_messages_update_recipient'
  ]);
  perform public._pp_drop_policies('neighbor_confirmations', array[
    'neighbor_confirmations_select_public',
    'neighbor_confirmations_insert_public',
    'neighbor_confirmations_select_auth',
    'neighbor_confirmations_insert_own'
  ]);
  perform public._pp_drop_policies('group_proposals', array[
    'group_proposals_select_public',
    'group_proposals_insert_public',
    'group_proposals_update_public',
    'group_proposals_select_auth',
    'group_proposals_insert_own',
    'group_proposals_update_own'
  ]);
  perform public._pp_drop_policies('group_proposal_votes', array[
    'group_proposal_votes_select_public',
    'group_proposal_votes_insert_public',
    'group_proposal_votes_select_auth',
    'group_proposal_votes_insert_own'
  ]);
end $$;

-- ---------------------------------------------------------------------------
-- Profily: číst můžou přihlášení (síť sousedů), měnit jen vlastní řádek
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy "profiles_select_auth" on public.profiles
  for select to authenticated
  using (true);

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = public.current_uid());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = public.current_uid())
  with check (id = public.current_uid());

create policy "profiles_delete_own" on public.profiles
  for delete to authenticated
  using (id = public.current_uid());

-- ---------------------------------------------------------------------------
-- Příspěvky: číst přihlášení, psát/mazat jen autor
-- ---------------------------------------------------------------------------

alter table public.posts enable row level security;

create policy "posts_select_auth" on public.posts
  for select to authenticated
  using (true);

create policy "posts_insert_own" on public.posts
  for insert to authenticated
  with check (author_id = public.current_uid());

create policy "posts_update_own" on public.posts
  for update to authenticated
  using (author_id = public.current_uid())
  with check (author_id = public.current_uid());

create policy "posts_delete_own" on public.posts
  for delete to authenticated
  using (author_id = public.current_uid());

-- ---------------------------------------------------------------------------
-- Zprávy: vidí a posílá jen odesílatel / příjemce
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.direct_messages') is null then
    return;
  end if;

  execute 'alter table public.direct_messages enable row level security';

  execute $p$
    create policy "direct_messages_select_own" on public.direct_messages
      for select to authenticated
      using (
        sender_id = public.current_uid()
        or recipient_id = public.current_uid()
      )
  $p$;

  execute $p$
    create policy "direct_messages_insert_own" on public.direct_messages
      for insert to authenticated
      with check (
        sender_id = public.current_uid()
        and sender_id <> recipient_id
      )
  $p$;

  execute $p$
    create policy "direct_messages_update_recipient" on public.direct_messages
      for update to authenticated
      using (recipient_id = public.current_uid())
      with check (recipient_id = public.current_uid())
  $p$;
end $$;

create or replace function public.dm_update_guard()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id
    or new.conversation_id is distinct from old.conversation_id
    or new.sender_id is distinct from old.sender_id
    or new.recipient_id is distinct from old.recipient_id
    or new.body is distinct from old.body
    or new.sender_name is distinct from old.sender_name
    or new.recipient_name is distinct from old.recipient_name
    or new.meta is distinct from old.meta
  then
    raise exception 'U zprávy lze změnit jen read_at';
  end if;
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.direct_messages') is null then
    return;
  end if;
  execute 'drop trigger if exists dm_update_guard on public.direct_messages';
  execute 'create trigger dm_update_guard before update on public.direct_messages for each row execute procedure public.dm_update_guard()';
end $$;

-- ---------------------------------------------------------------------------
-- Potvrzení sousedství
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.neighbor_confirmations') is null then
    return;
  end if;

  execute 'alter table public.neighbor_confirmations enable row level security';

  execute $p$
    create policy "neighbor_confirmations_select_auth" on public.neighbor_confirmations
      for select to authenticated
      using (true)
  $p$;

  execute $p$
    create policy "neighbor_confirmations_insert_own" on public.neighbor_confirmations
      for insert to authenticated
      with check (
        confirmer_id = public.current_uid()
        and confirmer_id <> neighbor_id
      )
  $p$;
end $$;

-- ---------------------------------------------------------------------------
-- Návrhy skupin: hlasování jen přes RPC (aby šlo zvýšit votes bez otevřeného UPDATE)
-- ---------------------------------------------------------------------------

do $$
begin
  if to_regclass('public.group_proposals') is not null then
    execute 'alter table public.group_proposals enable row level security';
    execute $p$
      create policy "group_proposals_select_auth" on public.group_proposals
        for select to authenticated
        using (true)
    $p$;
    execute $p$
      create policy "group_proposals_insert_own" on public.group_proposals
        for insert to authenticated
        with check (proposer_id = public.current_uid())
    $p$;
    execute $p$
      create policy "group_proposals_update_own" on public.group_proposals
        for update to authenticated
        using (proposer_id = public.current_uid())
        with check (proposer_id = public.current_uid())
    $p$;
  end if;

  if to_regclass('public.group_proposal_votes') is not null then
    execute 'alter table public.group_proposal_votes enable row level security';
    execute $p$
      create policy "group_proposal_votes_select_auth" on public.group_proposal_votes
        for select to authenticated
        using (true)
    $p$;
    execute $p$
      create policy "group_proposal_votes_insert_own" on public.group_proposal_votes
        for insert to authenticated
        with check (voter_id = public.current_uid())
    $p$;
  end if;
end $$;

create or replace function public.cast_group_proposal_vote(p_proposal_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid text := public.current_uid();
  inserted int;
  rec record;
begin
  if to_regclass('public.group_proposals') is null then
    raise exception 'group_proposals table missing';
  end if;
  if uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.group_proposal_votes (proposal_id, voter_id)
  values (p_proposal_id, uid)
  on conflict do nothing;
  get diagnostics inserted = row_count;

  if inserted = 0 then
    select * into rec from public.group_proposals where id = p_proposal_id;
    return jsonb_build_object('alreadyVoted', true, 'proposal', to_jsonb(rec));
  end if;

  update public.group_proposals
  set
    votes = votes + 1,
    active = (votes + 1) >= required,
    status = case when (votes + 1) >= required then 'aktivni' else status end
  where id = p_proposal_id
  returning * into rec;

  return jsonb_build_object('alreadyVoted', false, 'proposal', to_jsonb(rec));
end;
$$;

revoke all on function public.cast_group_proposal_vote(text) from public;
grant execute on function public.cast_group_proposal_vote(text) to authenticated;

drop function if exists public._pp_drop_policies(text, text[]);
