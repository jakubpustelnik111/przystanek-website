# Przystanek Duży Pokój

Strona internetowa sali Przystanek Duży Pokój: strona główna z galerią, rezerwacje z kalendarzem oraz podstrona kolektywu r4b4n.

## Struktura

```
index.html        strona (trzy zakładki: Start, Rezerwacje, r4b4n)
css/style.css     style
js/main.js        galerie, kalendarze, formularz rezerwacji, EmailJS
img/              logo, zdjęcia (start/ i r4b4n/)
```

## Uruchomienie

Otwórz `index.html` w przeglądarce. Strona nie wymaga instalacji.

## GitHub Pages

Settings → Pages → Branch: `main`, folder `/ (root)`. Strona będzie pod adresem `https://TWOJ-LOGIN.github.io/NAZWA-REPO/`.

## Wysyłanie rezerwacji na e-mail (EmailJS)

Formularz rezerwacji wysyła zgłoszenia przez EmailJS. Trzeba to ustawić jednorazowo:

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
5. W `js/main.js` podmień na początku pliku wartości `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID` i `EMAILJS_PUBLIC_KEY`.
6. (Zalecane) W EmailJS w **Account → Security** dodaj adres swojej strony do dozwolonych domen, żeby nikt inny nie mógł używać Twojego klucza.

Public Key jest przeznaczony do jawnego użycia w kodzie strony. Darmowy plan EmailJS pozwala na 200 maili miesięcznie.

## Do uzupełnienia

- Teksty w sekcjach „O sali", „Możliwości" oraz w zakładce r4b4n.
- Kolejne wydarzenia w kalendarzu r4b4n: stała `EVENTS` w `js/main.js`.
- Rezerwacje oznaczają zajęte terminy tylko w przeglądarce danej osoby (localStorage). Żeby wszyscy widzieli te same zajęte daty, trzeba podłączyć wspólną bazę danych.
