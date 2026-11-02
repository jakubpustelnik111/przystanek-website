-- Wydarzenia w sali (sekcja "Wydarzenia" na stronie głównej).
-- Uruchom JEDEN RAZ w Supabase: SQL Editor -> New query -> wklej całość -> Run. Nic nie usuwa.

create table if not exists public.venue_events (
  id          bigint generated always as identity primary key,
  event_date  date not null,
  title       text not null check (char_length(title) between 1 and 120),
  time_text   text,
  description text check (char_length(description) <= 1500),
  fb_url      text,
  poster_url  text,
  created_at  timestamptz not null default now()
);
alter table public.venue_events enable row level security;

drop policy if exists "venue events read" on public.venue_events;
create policy "venue events read" on public.venue_events for select to anon, authenticated using (true);
drop policy if exists "venue events admin insert" on public.venue_events;
create policy "venue events admin insert" on public.venue_events for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');
drop policy if exists "venue events admin update" on public.venue_events;
create policy "venue events admin update" on public.venue_events for update to authenticated
  using ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');
drop policy if exists "venue events admin delete" on public.venue_events;
create policy "venue events admin delete" on public.venue_events for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');
grant select on public.venue_events to anon, authenticated;
grant insert, update, delete on public.venue_events to authenticated;

-- daty wydarzeń w sali są zajęte także dla próśb o rezerwację
create or replace function public.reservations_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from 'pending' then
    return new;
  end if;
  if new.email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'BAD_EMAIL' using errcode = 'P0001';
  end if;
  if char_length(coalesce(new.phone, '')) < 6 then
    raise exception 'BAD_PHONE' using errcode = 'P0001';
  end if;
  if exists (select 1 from reservations r where r.event_date = new.event_date and r.status = 'confirmed')
     or exists (select 1 from r4b4n_events e where e.event_date = new.event_date)
     or exists (select 1 from venue_events v where v.event_date = new.event_date) then
    raise exception 'DATE_TAKEN' using errcode = 'P0001';
  end if;
  if exists (select 1 from reservations r where lower(r.email) = lower(new.email)
             and r.event_date = new.event_date and r.status = 'pending') then
    raise exception 'DUPLICATE' using errcode = 'P0001';
  end if;
  if (select count(*) from reservations r where lower(r.email) = lower(new.email)
      and r.created_at > now() - interval '24 hours') >= 3 then
    raise exception 'LIMIT_EMAIL' using errcode = 'P0001';
  end if;
  if (select count(*) from reservations r where r.created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'LIMIT_GLOBAL' using errcode = 'P0001';
  end if;
  if (select count(*) from reservations r where r.status = 'pending') >= 30 then
    raise exception 'LIMIT_PENDING' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

