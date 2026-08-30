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

Strona jest jednostronicowa — nawigacja to kotwice (`#informacje`, `#shuttle`,
`#dresscode`, `#rsvp`).

## Lokalny podgląd

```bash
cd "60kopra" && python3 -m http.server 5174
```

Uwaga: `/api/rsvp` nie działa pod `http.server`. Do testu end-to-end użyj
`npx vercel dev` albo deploya preview.

## Deploy — stan na 2026-08-30

- **Projekt Vercel:** `szymons-projects-a6eee558/60kopra`, Root Directory = `60kopra`
- **Produkcja:** https://60kopra.vercel.app — działa
- **Deploy:** automatyczny z `main` w repo `koper545-wq/ks-wedding-preview-x7q2`.
  CLI-owe `vercel --prod` z tego katalogu **nie zadziała** — Root Directory
  `60kopra` nie istnieje wewnątrz samego `60kopra/`. Deployujemy pushem do gita.
- **Ochrona:** Vercel Authentication zdjęta z produkcji (`ssoProtection.deploymentType = preview`),
  więc goście wchodzą bez logowania; preview deploye zostają chronione.

### Domena — czeka na DNS w home.pl

`60kopra.pl` i `www.60kopra.pl` są dodane do projektu, ale domena stoi na
nameserverach home.pl (`dns.home.pl`, `dns2`, `dns3`) i nie ma jeszcze rekordów.
Do dodania w panelu home.pl:

| typ | nazwa | wartość |
|---|---|---|
| `A` | `60kopra.pl` (@) | `216.198.79.1` |
| `CNAME` | `www` | `efc33eb6540a0c7e.vercel-dns-017.com.` |

Starsze wartości Vercela (`76.76.21.21` / `cname.vercel-dns.com.`) też działają,
gdyby panel home.pl nie przyjął powyższych.

Sanity check po zmianie:

```bash
dig +short 60kopra.pl A @dns.home.pl
```

Uwaga z poprzedniej rundy na tej samej rejestraturze: home.pl potrafi przyjąć
wpisy w panelu, a nie zbumpować serialu SOA — wtedy zmiany nie trafiają na ich
autorytatywne serwery i trzeba dzwonić na support.

## Zmienne środowiskowe (Vercel → Settings → Environment Variables)

| zmienna | wymagana | opis |
|---|---|---|
| `SHEETS_WEBHOOK_URL` | tak | URL wdrożenia Apps Script (patrz `apps-script.gs`) |
| `ADMIN_NOTIFY_EMAIL` | zalecane | maile (po przecinku) — dostaną RSVP, gdy arkusz padnie |
| `RESEND_API_KEY` | opcjonalna | bez niej maile potwierdzające są pomijane |
| `MAIL_FROM` | opcjonalna | domyślnie `urodziny <kontakt@60kopra.pl>` |
| `MAIL_REPLY_TO` | opcjonalna | domyślnie `kontakt@60kopra.pl` |
| `SITE_URL` | opcjonalna | domyślnie `https://60kopra.pl` |

**Dopóki `SHEETS_WEBHOOK_URL` nie jest ustawiony, formularz RSVP zwraca 503 i
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

## Stylistyka

Wzorowana na zaproszeniu z Figmy — plik `Wedding (Copy)`, node `2008:539`.
Stamtąd pochodzą: tło `#042406`, kremowa ramka `#EBE5D9` z promieniem 50,
kroje **Bona Nova SC** (60 / URODZINY / nagłówki sekcji), **Antic Didone**
(data, miejsce, wartości) i **Inter** (reszta), ziarno na całej stronie oraz
logo klubu (`img/wgc-logo.png` — eksport assetu z Figmy, 4096×826,
proporcja 4.959 zachowana w renderze).

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
