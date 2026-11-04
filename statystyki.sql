-- Licznik odwiedzin (zastosowany w bazie 4.11.2026 przez Claude jako migracja "visit_counter").
-- Anonimowy: tylko liczby wyświetleń zakładek na dzień, bez cookies i danych osobowych.
-- Odczyt statystyk wyłącznie dla administratora (pasek „Tryb administratora” na stronie).
create table if not exists public.page_views (
  day   date not null default current_date,
  view  text not null,
  views integer not null default 0,
  primary key (day, view)
);
alter table public.page_views enable row level security;
revoke all on public.page_views from anon, authenticated;
-- funkcje public.track_visit(text) i public.visit_stats(): patrz historia migracji w Supabase
