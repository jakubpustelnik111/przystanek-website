-- Wspólna baza rezerwacji dla strony Przystanek Duży Pokój (Supabase).
-- Wklej całość w Supabase: SQL Editor -> New query -> Run.

create table if not exists public.reservations (
  id          bigint generated always as identity primary key,
  event_date  date not null unique,              -- jeden termin = jedna rezerwacja
  title       text not null check (char_length(title) between 1 and 120),
  name        text not null check (char_length(name)  between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  phone       text check (char_length(phone) <= 40),
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
