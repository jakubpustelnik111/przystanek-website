# Przystanek Duży Pokój

Strona internetowa sali Przystanek Duży Pokój: strona główna z galerią, rezerwacje z kalendarzem oraz podstrona kolektywu r4b4n.

## Struktura

```
index.html        strona (trzy zakładki: Start, Rezerwacje, r4b4n)
css/style.css     style
js/main.js        galerie, kalendarze, formularz rezerwacji, panel administratora
supabase-setup.sql  skrypt tworzący wspólną bazę rezerwacji
img/              logo, zdjęcia (start/ i r4b4n/)
```

## Uruchomienie

Otwórz `index.html` w przeglądarce. Strona nie wymaga instalacji.

## GitHub Pages

Settings → Pages → Branch: `main`, folder `/ (root)`. Strona będzie pod adresem `https://TWOJ-LOGIN.github.io/NAZWA-REPO/`.

## Wysyłanie rezerwacji na e-mail (na razie wyłączone)

Wysyłka zgłoszeń na e-mail jest na razie usunięta z kodu, formularz zapisuje rezerwacje tylko w przeglądarce. Planowany sposób to EmailJS. Przygotowane w panelu EmailJS dane:
Service ID `service_eps05b4`, Template ID `template_0ctif7a`, Public Key `dQ49Nuh02xl2ElqT1` (Public Key jest przeznaczony do jawnego użycia w kodzie strony).

Instrukcja konfiguracji EmailJS, gdy wrócimy do tematu:

1. Załóż darmowe konto na https://www.emailjs.com.
2. **Email Services → Add New Service** → wybierz Gmail i połącz swoje konto. Skopiuj **Service ID**.
3. **Email Templates → Create New Template**:
   - **To Email:** adres, na który mają przychodzić zgłoszenia,
   - **Reply To:** `{{email}}`,
   - **Subject:** `{{subject}}`,
   - **Content:**
     ```
     Data: {{date}}
     Tytuł wydarzenia: {{title}}
     Imię i nazwisko: {{name}}
     E-mail: {{email}}
     Telefon: {{phone}}
     Uwagi: {{note}}
     ```
   - zapisz i skopiuj **Template ID**.
4. **Account → General** → skopiuj **Public Key**.
5. W `js/main.js` dodaj wysyłkę do `https://api.emailjs.com/api/v1.0/email/send` z tymi trzema wartościami (kod do przywrócenia mogę dopisać na życzenie).
6. (Zalecane) W EmailJS w **Account → Security** dodaj adres swojej strony do dozwolonych domen, żeby nikt inny nie mógł używać Twojego klucza.

Public Key jest przeznaczony do jawnego użycia w kodzie strony. Darmowy plan EmailJS pozwala na 200 maili miesięcznie.

## Wspólna baza rezerwacji (Supabase)

Dzięki niej zajęte terminy widzą wszyscy odwiedzający, a Ty możesz usuwać rezerwacje. Bez tej konfiguracji strona działa, ale rezerwacje zapisują się tylko w przeglądarce danej osoby.

1. Załóż darmowe konto i projekt na https://supabase.com (**New project**, region np. Frankfurt).
2. **SQL Editor → New query**: wklej całą zawartość pliku `supabase-setup.sql` i kliknij **Run**. Skrypt tworzy tabelę `reservations` oraz zabezpieczenia: odwiedzający mogą tylko dodać rezerwację i zobaczyć zajęte daty, bez imion, maili i telefonów.
3. **Authentication → Users → Add user → Create new user**: podaj swój e-mail (ten sam co w `supabase-setup.sql`) i hasło, zaznacz auto-potwierdzenie. To Twoje konto administratora na stronie.
4. **Authentication → Sign In / Providers**: wyłącz **Allow new users to sign up**, żeby nikt inny nie mógł założyć konta.
5. **Project Settings → API**: skopiuj **Project URL** oraz klucz **Publishable** (lub **anon**).
6. W `js/main.js` wpisz je w stałe `SUPABASE_URL` i `SUPABASE_KEY` na początku sekcji „rezerwacje”. Ten klucz jest publiczny i przeznaczony do użycia w kodzie strony.

**Usuwanie terminów:** na stronie w zakładce Rezerwacje kliknij na dole „Panel administratora”, zaloguj się e-mailem i hasłem z kroku 3. Zobaczysz pełne dane rezerwacji i przycisk „Usuń” przy każdej. Rezerwacje możesz też przeglądać i usuwać w Supabase w **Table Editor**.

Uwaga: każdy odwiedzający może zająć dowolny wolny termin, więc zdarzają się też fałszywe rezerwacje, które usuniesz w panelu.

## Do uzupełnienia

- Teksty w sekcjach „O sali", „Możliwości" oraz w zakładce r4b4n.
- Kolejne wydarzenia w kalendarzu r4b4n: stała `EVENTS` w `js/main.js`.
