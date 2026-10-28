-- Wspólna baza rezerwacji dla strony Przystanek Duży Pokój (Supabase).
-- Wklej całość w Supabase: SQL Editor -> New query -> Run.
-- PO NIM uruchom rezerwacje-v2.sql (prośby o rezerwację z potwierdzaniem, telefon, opis publiczny).
--
-- Jeśli wcześniej uruchomiłeś starszą wersję skryptu (z obowiązkowymi kolumnami name i phone),
-- uruchom jednorazowo tylko to. Dzięki temu działa i stara, i nowa wersja formularza:
--   alter table public.reservations alter column name  drop not null;
--   alter table public.reservations alter column phone drop not null;

create table if not exists public.reservations (
  id          bigint generated always as identity primary key,
  event_date  date not null unique,              -- jeden termin = jedna rezerwacja
  title       text not null check (char_length(title) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  note        text check (char_length(note)  <= 1000),
  created_at  timestamptz not null default now()
);

alter table public.reservations enable row level security;

-- Każdy odwiedzający może DODAĆ rezerwację, ale nikt nie może odczytać danych osobowych przez stronę.
drop policy if exists "anon moze dodawac rezerwacje" on public.reservations;
create policy "anon moze dodawac rezerwacje"
  on public.reservations for insert to anon with check (true);

-- Strona pobiera tylko zajęte daty (bez imion, maili i telefonów).
create or replace function public.busy_dates()
returns table(event_date date)
language sql
security definer
set search_path = public
as $$
  select r.event_date from public.reservations r where r.event_date >= current_date - 1;
$$;

revoke all on function public.busy_dates() from public;
grant execute on function public.busy_dates() to anon;

-- Administrator (Ty): tylko zalogowane konto o tym adresie e-mail może czytać dane i usuwać terminy.
-- Zmień adres, jeśli logujesz się innym.
drop policy if exists "admin moze czytac" on public.reservations;
create policy "admin moze czytac"
  on public.reservations for select to authenticated
  using ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');

drop policy if exists "admin moze usuwac" on public.reservations;
create policy "admin moze usuwac"
  on public.reservations for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');

-- ===== Wydarzenia r4b4n (kalendarz w zakładce r4b4n) =====
create table if not exists public.r4b4n_events (
  id bigint generated always as identity primary key,
  event_date date not null unique,
  title text not null,
  created_at timestamptz not null default now()
);
alter table public.r4b4n_events enable row level security;
drop policy if exists "r4b4n events read" on public.r4b4n_events;
create policy "r4b4n events read" on public.r4b4n_events for select to anon, authenticated using (true);
drop policy if exists "r4b4n events admin insert" on public.r4b4n_events;
create policy "r4b4n events admin insert" on public.r4b4n_events for insert to authenticated
  with check (auth.jwt()->>'email' = 'jakubpustelnik2006@gmail.com');
drop policy if exists "r4b4n events admin delete" on public.r4b4n_events;
create policy "r4b4n events admin delete" on public.r4b4n_events for delete to authenticated
  using (auth.jwt()->>'email' = 'jakubpustelnik2006@gmail.com');
grant select on public.r4b4n_events to anon, authenticated;
grant insert, delete on public.r4b4n_events to authenticated;
insert into public.r4b4n_events (event_date, title) values ('2026-11-14', '2Faces first edition') on conflict (event_date) do nothing;
