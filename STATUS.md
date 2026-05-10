# klara&szymon — wedding site setup status

Ostatnia aktualizacja: 2026-05-10

## Co jest live

- **Production URL (Vercel):** https://ks-wedding-preview.vercel.app — działa
- **Repo:** https://github.com/koper545-wq/ks-wedding-preview-x7q2 — auto-deploy z `main`
- **Vercel project:** `szymons-projects-a6eee558/ks-wedding-preview`
- **Domena docelowa:** klaraiszymon.pl + www.klaraiszymon.pl — dodane do projektu Vercel, czekają na DNS

## Co czeka na DNS home.pl

- A `klaraiszymon.pl` → `76.76.21.21`
- CNAME `www` → `cname.vercel-dns.com.`
- 4 rekordy Resend (DKIM, SPF MX, SPF TXT, DMARC) — DKIM się przepropagował (Resend pokazał ✅), reszta SPF Pending

**Problem:** wpisy są dodane w panelu home.pl, ale SOA serial = 17 (nie bumpa się), czyli zmiany nie trafiają na ich autorytatywne serwery DNS. Kontakt z home.pl support może być potrzebny jeśli po kilku godzinach dalej brak.

Sanity check:
```
dig +short SOA klaraiszymon.pl @dns.home.pl
dig +short klaraiszymon.pl A @dns.home.pl
```

## RSVP backend — stan prac

### Vercel env vars (już dodane)
- `RESEND_API_KEY` ✅ (Production + Preview)
- `SHEETS_WEBHOOK_URL` ✅ (Production)
- `MAIL_FROM` (default: `klara & szymon <kontakt@klaraiszymon.pl>`)
- `MAIL_REPLY_TO` (default: `kontakt@klaraiszymon.pl`)

### Resend
- Domain: klaraiszymon.pl dodana
- API key: utworzony, nazwa env zmieniona na `RESEND_API_KEY`
- DKIM Verified ✅
- SPF Pending (czeka na propagację reszty rekordów na home.pl)

### Google Sheet
- Sheet: https://docs.google.com/spreadsheets/d/14-GY0VMSr9EmUfVSOxY369XWs5mQ_ER9uDX7gaknNhs/edit
- Apps Script project: `RSVP1`
- Web App URL (do `SHEETS_WEBHOOK_URL`):
  `https://script.google.com/macros/s/AKfycbyTGg0cI3qJDsVUuozdkLfj3cWEvaR9EFtMHBX_aJTEUBXdNbf9BWveHkzmV9t9u98X/exec`

**ZABLOKOWANE NA:** Web App zwraca *"Nie udało się otworzyć pliku"* przy POST.
Powód: `SpreadsheetApp.openById(...)` wymaga dodatkowej zgody OAuth (Drive scope).

**Krok do wykonania kiedy wrócimy:**
1. W Apps Script editor dodaj funkcję:
   ```js
   function testAuth() {
     const sheet = SpreadsheetApp.openById('14-GY0VMSr9EmUfVSOxY369XWs5mQ_ER9uDX7gaknNhs').getSheets()[0];
     Logger.log('Otworzono: ' + sheet.getName());
   }
   ```
2. Wybierz `testAuth` z dropdownu funkcji → ▶️ Uruchom
3. Autoryzuj nowy scope (Drive)
4. Po autoryzacji → Wdróż → Zarządzaj wdrożeniami → ✏️ → *Wersja: Nowa wersja* → Wdróż

Test po fix:
```
curl -sL --post301 --post302 --post303 -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"smoke","attending":"yes","email":"a@b.c"}' \
  https://script.google.com/macros/s/AKfycbyTGg0cI3qJDsVUuozdkLfj3cWEvaR9EFtMHBX_aJTEUBXdNbf9BWveHkzmV9t9u98X/exec
```
Oczekiwane: `{"ok":true}` + nowy wiersz w Sheet.

### Endpoint /api/rsvp
- Plik: `api/rsvp.js`
- Walidacja, forward do Sheets webhooka, mail przez Resend
- Test (działa, błędy gracefully):
  ```
  curl -X POST https://ks-wedding-preview.vercel.app/api/rsvp \
    -H "Content-Type: application/json" \
    -d '{"name":"x","attending":"yes","email":"a@b.c"}'
  ```

### Form wiring
- `rsvp.jsx` zaktualizowany — `submit()` POST-uje do `/api/rsvp`
- Loading state + error state w UI
- localStorage zachowuje dane nawet jak network padnie

## Co zostało do zrobienia (kolejność po wznowieniu)

1. **DNS home.pl** — wymusić propagację (może support call) → A + CNAME działają
2. **Resend** → klik *Verify* — wszystkie rekordy zazielenią
3. **Vercel domeny** → automatycznie wystawi cert SSL dla klaraiszymon.pl
4. **Apps Script** → `testAuth()` + reauth + new version
5. **End-to-end test** → wypełnić formularz na produkcji → sprawdzić wiersz w Sheet + maila

## Przydatne komendy

```bash
# Lokalny preview
python3 -m http.server 5173

# Vercel deploy
export VERCEL_TOKEN="..."
npx --yes vercel@latest --prod --yes --token "$VERCEL_TOKEN"

# DNS check
dig +short klaraiszymon.pl A @dns.home.pl
dig +short SOA klaraiszymon.pl @dns.home.pl

# Vercel env list
npx --yes vercel@latest env ls --token "$VERCEL_TOKEN"
```

## Token security

⚠️ Vercel token był wklejony w czat — zrevoke'uj go w
*Vercel → Account Settings → Tokens* przy najbliższej okazji.
