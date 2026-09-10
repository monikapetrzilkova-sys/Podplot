-- Sdílená správa úřadu / podniku (víc lidí na jednom subjektu).
-- Spusť po rls_secure.sql.

alter table public.profiles add column if not exists institution_id text;
alter table public.profiles add column if not exists business_ico text;
alter table public.profiles add column if not exists org_role text;
alter table public.profiles add column if not exists contact_name text;

create index if not exists profiles_institution_id_idx on public.profiles (institution_id);
create index if not exists profiles_business_ico_idx on public.profiles (business_ico);
