
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
