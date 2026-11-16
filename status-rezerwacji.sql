-- Strona statusu rezerwacji (#status/KOD). Wykonane 16.11.2026 przez konektor Supabase (migracja reservation_status_page).
alter table public.reservations add column if not exists code text;
alter table public.reservations drop constraint if exists reservations_code_check;
alter table public.reservations add constraint reservations_code_check check (code is null or code ~ '^[A-Z2-9]{8,16}$');
create unique index if not exists reservations_code_key on public.reservations (code) where code is not null;
alter table public.reservations add column if not exists decided_at timestamptz;
alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations add constraint reservations_status_check check (status in ('pending','confirmed','rejected'));
drop policy if exists "anon moze dodawac rezerwacje" on public.reservations;
create policy "anon moze dodawac rezerwacje" on public.reservations for insert to anon
  with check (status = 'pending' and event_date >= current_date and code is not null);
create or replace function public.reservation_status(p_code text)
returns table(event_date date, title text, status text, created_at timestamptz, decided_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.event_date, r.title, r.status, r.created_at, r.decided_at from public.reservations r
  where r.code is not null and r.code = upper(trim(p_code)) limit 1;
$$;
revoke all on function public.reservation_status(text) from public;
grant execute on function public.reservation_status(text) to anon, authenticated;
