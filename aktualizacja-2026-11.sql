-- Aktualizacja bazy (listopad 2026): wydarzenia r4b4n w całości w bazie + ochrona formularza przed spamem.
-- Uruchom JEDEN RAZ w Supabase: SQL Editor -> New query -> wklej całość -> Run.
-- Skrypt jest bezpieczny do ponownego uruchomienia i nie usuwa danych.
-- Zawiera też wszystko z r4b4n-events-v2.sql, więc nie trzeba uruchamiać tamtego osobno.

------------------------------------------------------------------
-- 1. Wydarzenia r4b4n: kolumny ze szczegółami
------------------------------------------------------------------
alter table public.r4b4n_events add column if not exists doors       text;
alter table public.r4b4n_events add column if not exists time_text   text;
alter table public.r4b4n_events add column if not exists lineup      text;
alter table public.r4b4n_events add column if not exists entry       text;
alter table public.r4b4n_events add column if not exists description text;
alter table public.r4b4n_events add column if not exists post_url    text;
alter table public.r4b4n_events add column if not exists poster_url  text;

drop policy if exists "r4b4n events admin update" on public.r4b4n_events;
create policy "r4b4n events admin update" on public.r4b4n_events for update to authenticated
  using ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');
grant update on public.r4b4n_events to authenticated;

-- folder na plakaty (oglądać może każdy, wgrywać i usuwać tylko administrator)
insert into storage.buckets (id, name, public) values ('posters', 'posters', true)
  on conflict (id) do update set public = true;
drop policy if exists "posters admin insert" on storage.objects;
create policy "posters admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'posters' and (auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');
drop policy if exists "posters admin delete" on storage.objects;
create policy "posters admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'posters' and (auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');

------------------------------------------------------------------
-- 2. Przeniesienie wydarzeń zapisanych dotąd w kodzie strony do bazy
--    (plakaty leżą w repozytorium, ścieżki są względne do strony)
------------------------------------------------------------------
insert into public.r4b4n_events (event_date, title, doors, time_text, lineup, entry, description, post_url, poster_url) values
 ('2026-11-01', 'Halloween Afterparty', null, '19:00 – late',
  'Grajek, Pusty + open decks', E'19:00–21:00: 15 zł\nod 21:00: 20 zł',
  'Halloweenowe afterparty powered by r4b4n w Przystanku Duży Pokój. Gramy my, czyli Grajek i Pusty, a także wybrane przez nas osoby w ramach open decks.',
  'https://www.instagram.com/p/DeZrSw3gl9A/', 'img/events/halloween-2026.jpg'),
 ('2026-11-14', '2Faces vol. 1', '19:45', '20:00–02:00',
  E'Stage 1 · od 20:00: ???, Frano, Grajek\nStage 2 · od 23:00: Kubaswat, Pusty, Rekrut', '20/30 zł',
  'Pierwsza edycja cyklu 2FACES: najpierw luźniejszy 1st Face nastawiony na zabawę, potem 2nd Face, w którym jako selektorzy i diggerzy pokazujemy Wam coś nowego. Wpadaj!',
  'https://www.instagram.com/p/Dew3KNdiMfJ/', 'img/events/2faces-vol1.jpg')
on conflict (event_date) do update set
  title = excluded.title, doors = excluded.doors, time_text = excluded.time_text, lineup = excluded.lineup,
  entry = excluded.entry, description = excluded.description, post_url = excluded.post_url, poster_url = excluded.poster_url;

------------------------------------------------------------------
-- 3. Ochrona formularza rezerwacji przed spamem (sprawdzane w bazie, nie da się obejść ze strony)
------------------------------------------------------------------
create or replace function public.reservations_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- tylko prośby od odwiedzających; administrator nie dodaje próśb przez formularz
  if new.status is distinct from 'pending' then
    return new;
  end if;

  if new.email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'BAD_EMAIL' using errcode = 'P0001';
  end if;
  if char_length(coalesce(new.phone, '')) < 6 then
    raise exception 'BAD_PHONE' using errcode = 'P0001';
  end if;

  -- termin zajęty (potwierdzona rezerwacja albo wydarzenie r4b4n)
  if exists (select 1 from reservations r where r.event_date = new.event_date and r.status = 'confirmed')
     or exists (select 1 from r4b4n_events e where e.event_date = new.event_date) then
    raise exception 'DATE_TAKEN' using errcode = 'P0001';
  end if;

  -- ta sama osoba nie wysyła drugi raz prośby na ten sam dzień
  if exists (select 1 from reservations r where lower(r.email) = lower(new.email)
             and r.event_date = new.event_date and r.status = 'pending') then
    raise exception 'DUPLICATE' using errcode = 'P0001';
  end if;

  -- maks. 3 prośby z jednego adresu e-mail na dobę
  if (select count(*) from reservations r where lower(r.email) = lower(new.email)
      and r.created_at > now() - interval '24 hours') >= 3 then
    raise exception 'LIMIT_EMAIL' using errcode = 'P0001';
  end if;

  -- maks. 10 próśb od wszystkich w ciągu 10 minut (zatrzymuje boty wysyłające seriami)
  if (select count(*) from reservations r where r.created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'LIMIT_GLOBAL' using errcode = 'P0001';
  end if;

  -- maks. 30 oczekujących próśb naraz (chroni skrzynkę i limit EmailJS)
  if (select count(*) from reservations r where r.status = 'pending') >= 30 then
    raise exception 'LIMIT_PENDING' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists reservations_guard on public.reservations;
create trigger reservations_guard before insert on public.reservations
  for each row execute function public.reservations_guard();
