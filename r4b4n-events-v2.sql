-- Wydarzenia r4b4n v2: szczegóły wydarzenia (godziny, line-up, wejście, opis, link do posta) i plakat.
-- Uruchom JEDEN RAZ w Supabase: SQL Editor -> New query -> wklej całość -> Run. Nic nie usuwa.

alter table public.r4b4n_events add column if not exists time_text   text;
alter table public.r4b4n_events add column if not exists lineup      text;
alter table public.r4b4n_events add column if not exists entry       text;
alter table public.r4b4n_events add column if not exists description text;
alter table public.r4b4n_events add column if not exists post_url    text;
alter table public.r4b4n_events add column if not exists poster_url  text;

-- administrator może edytować wydarzenia
drop policy if exists "r4b4n events admin update" on public.r4b4n_events;
create policy "r4b4n events admin update" on public.r4b4n_events for update to authenticated
  using ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');
grant update on public.r4b4n_events to authenticated;

-- publiczny folder na plakaty (każdy może je oglądać, wgrywać i usuwać tylko administrator)
insert into storage.buckets (id, name, public) values ('posters', 'posters', true)
  on conflict (id) do update set public = true;

drop policy if exists "posters admin insert" on storage.objects;
create policy "posters admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'posters' and (auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');

drop policy if exists "posters admin delete" on storage.objects;
create policy "posters admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'posters' and (auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');
