-- Administrator może sam oznaczyć termin jako zajęty (bez prośby od gościa),
-- np. dla wydarzeń ustalonych bezpośrednio przez Pawła lub Dominika.
-- Wykonane 7.11.2026 przez konektor Supabase (migracja admin_insert_reservations).
drop policy if exists "admin moze dodawac" on public.reservations;
create policy "admin moze dodawac"
  on public.reservations for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'jakubpustelnik2006@gmail.com');
grant insert on public.reservations to authenticated;
