-- Rezerwacje v2: prośby o rezerwację z potwierdzaniem przez administratora.
-- Uruchom JEDEN RAZ w Supabase: SQL Editor -> New query -> wklej całość -> Run.
-- Skrypt jest bezpieczny do ponownego uruchomienia i NIE usuwa istniejących rezerwacji
-- (dotychczasowe wpisy zostają jako potwierdzone).

-- 1. Nowe kolumny
alter table public.reservations add column if not exists phone       text;
alter table public.reservations add column if not exists status      text not null default 'confirmed';
alter table public.reservations add column if not exists is_public   boolean not null default false;
alter table public.reservations add column if not exists public_desc text;
-- od teraz nowe wpisy domyślnie czekają na potwierdzenie
alter table public.reservations alter column status set default 'pending';

alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations add constraint reservations_status_check check (status in ('pending','confirmed'));
alter table public.reservations drop constraint if exists reservations_public_desc_check;
alter table public.reservations add constraint reservations_public_desc_check check (char_length(public_desc) <= 200);
alter table public.reservations drop constraint if exists reservations_phone_check;
alter table public.reservations add constraint reservations_phone_check check (char_length(phone) <= 30);

-- 2. Na jeden dzień może być kilka próśb, ale tylko jedna POTWIERDZONA rezerwacja
alter table public.reservations drop constraint if exists reservations_event_date_key;
create unique index if not exists reservations_one_confirmed_per_day
  on public.reservations (event_date) where status = 'confirmed';

-- 3. Odwiedzający może wysłać tylko prośbę (status "oczekuje") na przyszły termin
drop policy if exists "anon moze dodawac rezerwacje" on public.reservations;
create policy "anon moze dodawac rezerwacje"
  on public.reservations for insert to anon
  with check (status = 'pending' and event_date >= current_date);

-- 4. Administrator może potwierdzać i edytować opis (oprócz czytania i usuwania, które już działają)
drop policy if exists "admin moze edytowac" on public.reservations;
create policy "admin moze edytowac"
  on public.reservations for update to authenticated
  using ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');
grant update on public.reservations to authenticated;

-- 5. Strona widzi tylko POTWIERDZONE terminy i opis wydarzeń otwartych (bez maili i telefonów)
drop function if exists public.busy_dates();
create function public.busy_dates()
returns table(event_date date, public_desc text)
language sql
security definer
set search_path = public
as $$
  select r.event_date, case when r.is_public then r.public_desc end
  from public.reservations r
  where r.status = 'confirmed' and r.event_date >= current_date - 1;
$$;
revoke all on function public.busy_dates() from public;
grant execute on function public.busy_dates() to anon, authenticated;
