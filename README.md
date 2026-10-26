# Przystanek Duży Pokój

Strona internetowa sali Przystanek Duży Pokój: strona główna z galerią, rezerwacje z kalendarzem oraz podstrona kolektywu r4b4n.

## Struktura

```
index.html      strona (trzy zakładki: Start, Rezerwacje, r4b4n)
css/style.css   style
js/main.js      galeria, kalendarz i formularz rezerwacji
img/logo.png    logo
```

## Uruchomienie

Otwórz `index.html` w przeglądarce. Strona nie wymaga instalacji.

## GitHub Pages

Settings → Pages → Branch: `main`, folder `/ (root)`. Strona będzie pod adresem `https://TWOJ-LOGIN.github.io/NAZWA-REPO/`.

## Do uzupełnienia

- Zdjęcia do galerii: w `index.html` podmień pola `<div class="slide">Zdjęcie 1</div>` na `<div class="slide"><img src="img/foto1.jpg" alt=""></div>`.
- Teksty w sekcjach „O sali", „Możliwości" oraz w zakładce r4b4n.
- Rezerwacje zapisują się na razie tylko w przeglądarce użytkownika (localStorage). Żeby były wspólne dla wszystkich, trzeba podłączyć backend lub wysyłanie zgłoszeń na e-mail.
