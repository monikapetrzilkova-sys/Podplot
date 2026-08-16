# Supabase — sdílené příspěvky (MVP)

Aby kamarádi na https://podplot.vercel.app viděli navzájem příspěvky:

## 1) Ty v Supabase (jednou)

1. Otevři projekt: https://supabase.com/dashboard
2. **SQL Editor** → New query
3. Zkopíruj celý obsah souboru `supabase/schema.sql` z tohoto repa → **Run**
4. (Volitelně) **Database → Publications** / Replication: zapni tabulku `posts` pro Realtime

Klíče už máš (`Project Settings → API`):
- Project URL → `VITE_SUPABASE_URL`
- `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

## 2) Já / CLI (Vercel env)

Na Vercel musí být:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Pak redeploy. Lokálně stačí hodnoty v `app/.env`.

## 3) Co funguje po napojení

- registrace uloží profil do `profiles`
- nové hlášení / inzerát ve feedu se uloží do `posts`
- ostatní testeri je načtou při otevření appky (+ realtime pokud je zapnuté)

## Poznámka k bezpečnosti

MVP RLS je otevřené (kdokoli s anon klíčem může číst/psát). Pro ostrý provoz později doplníme Auth + přísnější politiky.
