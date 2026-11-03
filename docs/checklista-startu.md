# Checklista startu strony (3.11.2026)

## Przed publikacją (blokery)
- [x] r4b4n: e-mail kontaktowy djgrajekkontakt@gmail.com zamiast tekstu zastępczego (`18fab25`)
- [x] Sekcja Wydarzenia działa (wydarzenia-sali.sql uruchomiony, potwierdzone 3.11)
- [ ] EmailJS → Account → Security: dozwolona domena (github.io, a po zakupie także własna) + limit częstotliwości
- [x] Test na żywo z telefonu: prośba o rezerwację → mail na skrzynce sali (sprawdzić spam) → „Potwierdź” w panelu → dzień zajęty dla gościa (karta prywatna) → usunąć test – udany 3.11
- [x] Usunąć testowe wpisy w panelu (w tym 31.01.2030) – zrobione 3.11
- [x] Poprawki techniczne: zapasowa czcionka etykiet formularza, kontrast pomarańczowego/zielonego tekstu (`18fab25`)
- [ ] Pojemność, cena („od X zł”), konkretny sprzęt – od Pawła
- [ ] Potwierdzić godziny otwarcia (poniedziałek), usunąć „wg Google”
- [ ] Zgoda Pawła na nazwisko w polityce prywatności; ewentualnie firma i NIP

## Domena
- Główna: przystanekduzypokoj.pl (bez myślników i polskich znaków). Opcjonalnie: duzypokoj.pl (krótsza), duzypokoj.poznan.pl (regionalna). Dostępność do sprawdzenia u rejestratora.
- Rejestratorzy: OVHcloud, cyber_Folks, home.pl, nazwa.pl. Porównywać cenę ODNOWIENIA, nie tylko pierwszego roku.
- Domena zarejestrowana na Pawła/salę, Jakub z dostępem do DNS.
- Podpięcie do GitHub Pages: rekordy A @ → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153; CNAME www → jakubpustelnik111.github.io; w repo plik CNAME (robi Claude); Settings → Pages → Custom domain + Enforce HTTPS.
- Po podpięciu: og:url/og:image w index.html (robi Claude), EmailJS dozwolona domena, link na wizytówce Google, w bio Instagrama i na fanpage'u, test podglądu w Facebook Sharing Debugger.

## W pierwszych tygodniach
- Zdjęcia wnętrza sali (duży kafelek ściany zdjęć) i drogi z przystanku do wejścia
- Ujednolicić nazwę fanpage'a („Przystanek Dartera”, adres Bodycamfan)
- Lepszy obrazek podglądu linku (og.jpg) bez twarzy gości
- FAQ (do której, napoje, wiek, kaucja, sprzątanie)
- Prosty licznik odwiedzin bez cookies (np. GoatCounter, Plausible)
- Przyklejony przycisk „Zarezerwuj” na telefonie, pasek najbliższego wydarzenia

## Później
- Adres e-mail w domenie (np. rezerwacje@…) z przekierowaniem na Gmail sali
- Automatyczna synchronizacja wydarzeń z fanpage'a (Graph API, wymaga administratora fanpage'a)
- Opinie gości z Google (prawdziwe, ze źródłem), odtwarzacz SoundCloud w r4b4n

Szczegółowe obserwacje z perspektywy odwiedzających: docs/obserwacje-uzytkownika.md
