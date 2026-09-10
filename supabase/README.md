# Supabase — Auth + zabezpečená databáze

Aby kamarádi na https://podplot.vercel.app viděli navzájem příspěvky a mohli se registrovat / přihlašovat — a aby to **nešlo stáhnout bez přihlášení**.

## 0) Bezpečnost (udělej teď)

Veřejný `anon` klíč v aplikaci **musí zůstat** — bez něj se sousedé nepřihlásí. Ochrana není schování klíče, ale **RLS politiky**.

1. Otevři projekt: https://supabase.com/dashboard
2. **SQL Editor** → New query
3. Když tabulky ještě nemáš, nejdřív spusť `trust.sql` (a podle potřeby `messages.sql`, `group_proposals.sql`). Pak vlož celý `supabase/rls_secure.sql` → **Run**. Chybějící tabulky skript přeskočí, nespadne.
4. **Authentication → Providers → Email** → zapnuto
5. **Project Settings → API**: `service_role` klíč **nikdy** nedávej do Vercelu, `.env` v gitu, ani do frontendu. Stačí `anon` / `public`.
6. **Project Settings → General**: zapni 2FA na svůj účet Supabase (ty jsi jediný správce dashboardu).

Po kroku 3 už náhodný návštěvník s anon klíčem **neuvidí** zprávy, e-maily ani příspěvky. Přihlášení sousedé ano — to aplikace potřebuje.

Kontrola: Table Editor → `direct_messages` pořád vidíš ty (vlastník). V appce bez přihlášení se nic nenačte.

## 1) SQL schématu (jen nové projekty)

1. SQL Editor → spusť `supabase/schema.sql`
2. Pak vždy `supabase/rls_secure.sql`

## 2) Auth (heslo a zapomenuté heslo)

1. **Authentication → Providers → Email** → zapnuto
2. Pro testování můžeš vypnout *Confirm email* (jinak po registraci musí uživatel kliknout v e-mailu)
3. **Authentication → URL Configuration**:
   - **Site URL:** `https://podplot.vercel.app`
   - **Redirect URLs:**
     - `https://podplot.vercel.app/`
     - `https://podplot.vercel.app/**`
     - `http://localhost:5173/`
4. Šablona *Reset password* je výchozí od Supabase

## 3) Klíče / Vercel

- Project URL → `VITE_SUPABASE_URL` nebo `SUPABASE_URL`
- `anon` `public` key → `VITE_SUPABASE_ANON_KEY` nebo `SUPABASE_ANON_KEY`

`service_role` na Vercel **nedávej**.

## 4) Co appka dělá

| Situace | Chování |
|--------|---------|
| Nový telefon / čistý prohlížeč | Musí se **registrovat** (e-mail + heslo) |
| Stejný telefon po aktualizaci / refresh | Zůstane **přihlášený** jen s platnou Supabase session |
| Odhlášení | Profil → **Odhlásit se** |
| Zapomenuté heslo | Přihlášení → **Zapomenuté heslo** |
| Zpráva na inzerát | `direct_messages` — vidí jen odesílatel a příjemce |

## 5) Zprávy / důvěra / skupiny (starší DB)

Pokud tabulky ještě nemáš (chyba `relation … does not exist`): spusť `messages.sql`, `trust.sql`, `group_proposals.sql`, a **pak znovu `rls_secure.sql`**. Aktualizovaný `rls_secure.sql` chybějící tabulky přeskočí.

Realtime: **Database → Publications** → u `supabase_realtime` zapni `posts`, `profiles`, `direct_messages`, `neighbor_confirmations`, `group_proposals`.

## 6) Sdílená správa úřadu / podniku

SQL Editor → spusť `supabase/org_members.sql` (sloupce `institution_id`, `business_ico`, `org_role`, `contact_name`).

## 7) Tipy na appku

1. SQL Editor → spusť `supabase/feedback.sql`
2. Tipy z Profilu / uvítací karty přistanou v **Table Editor → app_feedback**
3. Když tabulka ještě není, appka otevře e-mail na `tipy@podplot.cz`
