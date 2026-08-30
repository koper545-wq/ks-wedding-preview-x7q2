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

## Deploy (Vercel)

Osobny projekt Vercel, **Root Directory = `60kopra`**, framework: Other.
Domena: `60kopra.pl` + `www.60kopra.pl`.

DNS (u rejestratora domeny):
- `A` `60kopra.pl` → `76.76.21.21`
- `CNAME` `www` → `cname.vercel-dns.com.`

## Zmienne środowiskowe (Vercel → Settings → Environment Variables)

| zmienna | wymagana | opis |
|---|---|---|
| `SHEETS_WEBHOOK_URL` | tak | URL wdrożenia Apps Script (patrz `apps-script.gs`) |
| `ADMIN_NOTIFY_EMAIL` | zalecane | maile (po przecinku) — dostaną RSVP, gdy arkusz padnie |
| `RESEND_API_KEY` | opcjonalna | bez niej maile potwierdzające są pomijane |
| `MAIL_FROM` | opcjonalna | domyślnie `urodziny <kontakt@60kopra.pl>` |
| `MAIL_REPLY_TO` | opcjonalna | domyślnie `kontakt@60kopra.pl` |
| `SITE_URL` | opcjonalna | domyślnie `https://60kopra.pl` |

Maile wychodzą tylko gdy gość poda adres **i** `RESEND_API_KEY` jest ustawiony.
Domena `60kopra.pl` musi być zweryfikowana w Resend (DKIM/SPF), inaczej Resend
odrzuci wysyłkę — brak konfiguracji nie psuje formularza, RSVP i tak leci do
arkusza.

## Test API po deployu

```bash
curl -X POST https://60kopra.pl/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"name":"smoke test","attending":"yes"}'
```

Oczekiwane: `{"ok":true,"sheets":true,...}` + nowy wiersz w arkuszu.

## Do uzupełnienia w `content.jsx`

Wszystkie miejsca oznaczone `TODO`: data i godzina (`EVENT.dateISO` musi być
prawdziwa — z niej liczy się odliczanie), miejsce i adres, godziny programu,
kursy shuttle'a, treść dress code'u, deadline RSVP.
