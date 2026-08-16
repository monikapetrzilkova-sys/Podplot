-- Úpravy existujících příspěvků (např. editace návrhu skupiny) potřebují UPDATE politiku.
-- Bez ní upsert při editaci tiše selže a po refreshi se vrátí starý text.

drop policy if exists "posts_update_public" on public.posts;
create policy "posts_update_public" on public.posts for update using (true) with check (true);
