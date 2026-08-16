# Supabase — sdílené příspěvky + Auth (MVP)

Aby kamarádi na https://podplot.vercel.app viděli navzájem příspěvky a mohli se registrovat / přihlašovat:

## 1) SQL (jednou)

1. Otevři projekt: https://supabase.com/dashboard
2. **SQL Editor** → New query
3. Zkopíruj celý obsah `supabase/schema.sql` → **Run**
4. (Volitelně) Realtime u tabulky `posts`

## 2) Auth (povinné pro heslo a zapomenuté heslo)

1. **Authentication → Providers → Email** → zapnuto
2. Pro snadné testování: **Authentication → Providers → Email** → vypni *Confirm email* (jinak po registraci musí uživatel nejdřív kliknout v e-mailu)
3. **Authentication → URL Configuration**:
   - **Site URL:** `https://podplot.vercel.app`
   - **Redirect URLs:** přidej
     - `https://podplot.vercel.app/`
     - `https://podplot.vercel.app/**`
     - `http://localhost:5173/` (lokální vývoj)
4. Šablona e-mailu *Reset password* je výchozí od Supabase (funguje i na free plánu)

## 3) Klíče / Vercel

- Project URL → `VITE_SUPABASE_URL`
- `anon` `public` key → `VITE_SUPABASE_ANON_KEY`

Na Vercelu už mají být nastavené; lokálně v `app/.env`.

## 4) Co appka dělá

| Situace | Chování |
|--------|---------|
| Nový telefon / čistý prohlížeč | Musí se **registrovat** (e-mail + heslo) |
| Stejný telefon po aktualizaci / refresh | Zůstane **přihlášený** (localStorage + Supabase session) |
| Odhlášení | Profil → **Odhlásit se** |
| Zapomenuté heslo | Přihlášení → **Zapomenuté heslo** → odkaz e-mailem |
| Změna hesla | Profil → sekce Heslo |
| Zpráva na inzerát / hlášení | Uloží se do `direct_messages` — druhý tester ji uvidí ve **Zprávách** |

## 5) Zprávy (když ještě nemáš tabulku)

1. SQL Editor → spusť celý `supabase/messages.sql`
2. (Volitelně) **Database → Publications** → u `supabase_realtime` zapni **`direct_messages`**

Bez kroku 5 odpovědi na inzerát zůstanou jen u odesílatele.

## Poznámka k bezpečnosti

MVP RLS u `profiles` / `posts` je stále otevřené pro testery. Později navážeme politiky na `auth.uid()`.
