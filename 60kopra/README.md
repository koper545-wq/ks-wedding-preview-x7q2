# 60kopra.pl — strona urodzinowa

Statyczna strona (React UMD + Babel standalone, bez builda) + jedna funkcja
serverless na Vercelu. Ta sama mechanika co strona weselna w katalogu wyżej.

## Struktura

```
60kopra/
  index.html      tokeny CSS + ładowanie skryptów  ← tu podmieniamy stylistykę
  content.jsx     CAŁA treść i dane wydarzenia     ← tu edytujemy teksty
  ui.jsx          prymitywy (Section, FactRow, Countdown, Button)
  sections.jsx    hero, informacje, shuttle, dress code, bez kwiatów, stopka
  rsvp.jsx        formularz RSVP (imię + czy będziesz + opcjonalny email)
  app.jsx         nawigacja i złożenie strony
  api/rsvp.js     POST /api/rsvp → Google Sheets (+ opcjonalny mail Resend)
  apps-script.gs  kod do wklejenia w Apps Script nowego arkusza
```

Landing one-pager, bez paska nawigacji. Kotwice nadal działają w linkach:
`#rsvp` (góra), `#informacje`, `#transport`, `#dresscode`, `#kwiaty`.

## Lokalny podgląd

```bash
cd "60kopra" && python3 -m http.server 5174
```

Uwaga: `/api/rsvp` nie działa pod `http.server`. Do testu end-to-end użyj
`npx vercel dev` albo deploya preview.

## Deploy — stan na 2026-08-30

- **Projekt Vercel:** `szymons-projects-a6eee558/60kopra`, Root Directory = `60kopra`
- **Produkcja:** https://60kopra.pl (i `www`) — działa, cert SSL wystawiony
- **Zapasowy URL:** https://60kopra.vercel.app
- **Deploy:** automatyczny z `main` w repo `koper545-wq/ks-wedding-preview-x7q2`.
  CLI-owe `vercel --prod` z tego katalogu **nie zadziała** — Root Directory
  `60kopra` nie istnieje wewnątrz samego `60kopra/`. Deployujemy pushem do gita.
- **Ochrona:** Vercel Authentication zdjęta z produkcji (`ssoProtection.deploymentType = preview`),
  więc goście wchodzą bez logowania; preview deploye zostają chronione.

### Domena — podpięta

`60kopra.pl` i `www.60kopra.pl` wskazują na Vercel, rekordy w home.pl są
ustawione i rozpropagowane:

| typ | nazwa | wartość |
|---|---|---|
| `A` | `60kopra.pl` | `216.198.79.1` |
| `CNAME` | `www.60kopra.pl` | `efc33eb6540a0c7e.vercel-dns-017.com.` |

`www` serwuje tę samą stronę (nie przekierowuje na apex). Gdyby zależało nam
na jednym kanonicznym adresie, w ustawieniach domeny w Vercelu można ustawić
redirect `www` → `60kopra.pl`.

## Zmienne środowiskowe (Vercel → Settings → Environment Variables)

| zmienna | wymagana | opis |
|---|---|---|
| `SHEETS_WEBHOOK_URL` | tak | **ustawione** — URL wdrożenia Apps Script (patrz `apps-script.gs`) |
| `ADMIN_NOTIFY_EMAIL` | zalecane | maile (po przecinku) — dostaną RSVP, gdy arkusz padnie |
| `RESEND_API_KEY` | opcjonalna | bez niej maile potwierdzające są pomijane |
| `MAIL_FROM` | opcjonalna | domyślnie `urodziny <kontakt@60kopra.pl>` |
| `MAIL_REPLY_TO` | opcjonalna | domyślnie `kontakt@60kopra.pl` |
| `SITE_URL` | opcjonalna | domyślnie `https://60kopra.pl` |

### Potwierdzenia mailem — bez zewnętrznej usługi

Maile wysyła **Apps Script (`MailApp`)**, czyli konto Google właściciela
skryptu. Nie ma tu Resend, klucza API ani rekordów DKIM/SPF. Limit darmowego
Gmaila to 100 adresatów na dobę.

Mail wychodzi **dopiero po udanym `appendRow`**, więc nikt nie dostanie
potwierdzenia zgłoszenia, którego nie ma w arkuszu. Wywrotka wysyłki nie
wywraca zapisu — Apps Script zwraca wtedy `mail: "failed: …"`, a funkcja
w Vercelu przekazuje ten status dalej i loguje.

Treść maila (osobna dla „tak" i „nie") żyje w `apps-script.gs` — jedno
miejsce, bez duplikatu po stronie Vercela.

**Po każdej zmianie kodu skryptu** trzeba zrobić Wdróż → Zarządzaj
wdrożeniami → ✏️ → Wersja: **Nowa wersja**. Sam zapis w edytorze nie
wpływa na to, co serwuje URL `/exec`.

**Gotcha z edytorem Apps Script:** selektor funkcji nie zapamiętuje wyboru
klikniętego automatem — edytor i tak uruchamia *pierwszą* funkcję w pliku.
Jeśli trzeba uruchomić coś konkretnego (np. żeby zatwierdzić nowy zakres
uprawnień), najprościej wstawić to tymczasowo na początek pliku. Wdrożona
wersja jest zamrożona, więc majstrowanie przy szkicu nie rusza produkcji.

### Arkusz RSVP — działa

- Arkusz: **RSVP 60 urodziny** —
  https://docs.google.com/spreadsheets/d/10KDYhsmMakHZXwAS3UZPNGmcu5BKSvH0GjZeIDQN6iI/edit
- Projekt Apps Script (samodzielny): `1j0Pz1nsWAs1kLc_8M1d8Qgkhm9PYXQaDxxydyoHLbfceVRsMMmbOAsUZ`
- Wdrożenie: aplikacja internetowa, „Wykonaj jako: Ja", „Kto ma dostęp: Każdy"
- `SHEETS_WEBHOOK_URL` ustawiony w Vercelu (production + preview + development)

Sprawdzone end-to-end: formularz na 60kopra.pl → `/api/rsvp` → wiersz w arkuszu,
z polskimi znakami włącznie.

**Uwaga przy testowaniu curl-em.** Apps Script wykonuje `doPost`, a potem
odsyła 302 na `script.googleusercontent.com`. Ten adres **nie przyjmuje POST-a**,
więc `curl --post301/302/303` kończy się 405 i stroną „Nie udało się otworzyć
pliku" — mimo że wiersz już się zapisał. Poprawnie:

```bash
curl -s -o /dev/null -w "%{redirect_url}" -X POST -d '...' "$WEBHOOK"   # 1. POST
curl -s "$ADRES_Z_PRZEKIEROWANIA"                                       # 2. GET
```

Node `fetch` z `redirect: 'follow'` robi to tak samo (302 zamienia POST na GET),
dlatego funkcja w Vercelu działa bez kombinowania.

**Gdyby `SHEETS_WEBHOOK_URL` zniknął, formularz RSVP zwraca 503 i
pokazuje gościowi błąd.** To celowe: bez arkusza i bez maila awaryjnego
zgłoszenie nie zostałoby nigdzie zapisane, a „zapisane" na ekranie byłoby
kłamstwem. Podpięcie arkusza (patrz `apps-script.gs`) odblokowuje formularz.

Maile wychodzą tylko gdy gość poda adres **i** `RESEND_API_KEY` jest ustawiony.
Domena `60kopra.pl` musi być zweryfikowana w Resend (DKIM/SPF), inaczej Resend
odrzuci wysyłkę — brak konfiguracji nie psuje formularza, RSVP i tak leci do
arkusza.

## Test API po deployu

```bash
curl -X POST https://60kopra.pl/api/rsvp -H "Content-Type: application/json" -d '{"name":"smoke test","attending":"yes"}'
```

Oczekiwane po podpięciu arkusza: `{"ok":true,"sheets":true,...}` + nowy wiersz.
Przed podpięciem: `503 {"ok":false,"error":"rsvp storage unavailable",...}`.

## Wysyłka zaproszenia (WhatsApp)

**PNG nie może zawierać hiperlinku** — to plik rastrowy, nie ma w nim warstwy
z odnośnikiem ani obszarów klikalnych. Żaden komunikator tego nie obejdzie.
Dlatego działają dwie osobne drogi i obie są przygotowane:

1. **Wklejenie samego linku `60kopra.pl`** — WhatsApp pobiera tagi Open Graph
   z `index.html` i rysuje kartę z grafiką `img/og.png`. **Cała karta jest
   klikalna** i otwiera stronę. To jest najbliższe „klikalnej grafice".
2. **Wysłanie `img/zaproszenie.png` jako zdjęcia**, z linkiem w podpisie —
   WhatsApp sam zamienia adres w podpisie na odnośnik. Grafika jest wtedy
   w pełnej jakości i pionowa, a adres `60KOPRA.PL` jest też wypalony na niej.

Najlepszy efekt daje jedno i drugie w jednej wiadomości: zdjęcie + podpis
z linkiem.

Obie grafiki generuje `scripts/make-share-images.py` (fonty ciągnie z Google
Fonts do `scripts/.fonts/`, poza repo):

```bash
python3 scripts/make-share-images.py
```

### Czego wymaga scraper WhatsAppa (sprawdzone bólem)

Przy pierwszym podejściu karta zaciągnęła tytuł i opis, ale **grafikę pominęła
bez żadnego błędu**. Winne były dwie rzeczy naraz:

- `og:image` wskazywał **PNG** — WhatsApp bywa wobec nich wybredny; JPEG jest
  pewny,
- adres miał **query string** (`?v=1`) — część scraperów się na tym wykłada.

Stąd `img/og.jpg`: JPEG, bez query stringa, poniżej 200 kB (generator sam
schodzi z jakością, aż się zmieści). Nie zamieniaj tego z powrotem na PNG.

**Cache.** WhatsApp trzyma miniaturę per adres i nie ma publicznego sposobu na
jej wyczyszczenie. Po podmianie grafiki ten sam link długo pokazuje starą
(albo pustą) kartę. Do sprawdzenia poprawki użyj innego adresu — wystarczy
`https://60kopra.pl/?i=1` albo `https://www.60kopra.pl` — bo dla cache'a to
osobne URL-e.

## Stylistyka

Wzorowana na zaproszeniu z Figmy — plik `Wedding (Copy)`, node `2008:539`.
Strona **nie odtwarza już samego zaproszenia** — to landing one-pager
z formularzem RSVP na samej górze i bez nawigacji. Z zaproszenia zostają
dane i język wizualny.

**Uwaga na kolor tła.** W kodzie z Figmy fill to `#042406`, ale to nie jest
kolor, który widać: leży na nim tekstura, która realnie daje **`#233B25`** —
i ta wartość jest w `--bg`. Gdyby ktoś kiedyś „poprawiał" tło do `#042406`
prosto z Figmy, strona zrobi się wyraźnie ciemniejsza niż zaproszenie.
Wartość wzięta z pomiaru pikseli renderu, nie z panelu warstw.

Tekst jest celowo **masełkowy** (`#F2E7CC`), a nie biały jak na zaproszeniu.

**Ziarno** nie jest nakładką ani `feTurbulence` — to `img/grain.png`, kafel
128×128 wygenerowany tak, żeby odtworzyć szum zmierzony na renderze
zaproszenia: czysty szum per-piksel (autokorelacja ≈ 0 już przy 1 px),
odchylenie standardowe ~10 na kanał, korelacja kanałów ~0,55 (szum lekko
kolorowy, nie mono). Kolor tła jest zapieczony w kafelku; `background-color`
został jako fallback. Generator z parametrami i ziarnem losowym siedzi
w historii commita — kafel jest deterministyczny.

**Kroje: uwaga na polskie znaki.** Zaproszenie używa **Antic Didone**, który
na Google Fonts **nie ma podzbioru latin-ext** — ą ć ę ł ń ś ź ż spadały na
Georgię. Bodoni Moda ma polski komplet, ale jako didone rysuje kreskę ł
włosowo i „bezpłatny" czytało się jak „bezplatny". Ostatecznie serif to
**Bona Nova** — ta sama superrodzina co display, krój Andrzeja Heidricha
projektowany pod polską typografię, z najwyraźniejszymi diakrytykami
z testowanych (kreska ł to 13,4% masy znaku wobec 8,3% w Bodoni Moda).

Podzbiór latin-ext kroju display dociągamy z góry w `app.jsx` — ekran po
wysłaniu RSVP wypisuje imię gościa, a bez tego „Paweł" mrugnąłby Georgią.

Kroje: **Bona Nova SC** (nagłówki), **Bona Nova** (data, miejsce,
wartości), **Inter** (reszta). Logo klubu
(`img/wgc-logo.png` — eksport assetu z Figmy, 4096×826, proporcja 4.959
zachowana w renderze) siedzi teraz w sekcji „kiedy i gdzie".

Tokeny siedzą w `:root` w `index.html` — cała zmiana kolorów idzie stamtąd.

## Do uzupełnienia w `content.jsx`

Dane z zaproszenia są już wpisane. `TODO` zostały tam, gdzie zaproszenie
milczało — sekcje renderują się bez nich, więc nic nieprawdziwego nie idzie
na produkcję:

- `informacje.facts` — godzina kolacji i koniec imprezy (teraz tylko data,
  początek 18:00 i miejsce)
- `transport.runs` — godziny kursów i przystanek; póki lista jest pusta,
  strona pokazuje „Dokładne godziny kursów podamy bliżej terminu."
- `dresscode.points` — doprecyzowanie, jeśli są konkretne życzenia
