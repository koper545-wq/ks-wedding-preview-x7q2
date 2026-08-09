# foto — zdjęcia i wideo od gości

Aplikacja do zbierania zdjęć/wideo od gości weselnych. Pliki lecą **prosto
z przeglądarki gościa na prywatny Google Drive** (resumable upload, chunki
8 MB) — przez serwerless przechodzi tylko inicjacja sesji (metadane), więc
limit 4,5 MB body na Vercelu nie gra roli.

## Jak to działa

1. Gość wchodzi na `foto.klaraiszymon.pl/?k=KOD` (kod z QR na stole).
2. Klient woła `POST /api/upload-session` z metadanymi pliku.
3. Serwer waliduje (kod, MIME `image/*`/`video/*`, max 2 GB, rate limit),
   odświeża access_token z refresh_tokena, inicjuje resumable session
   w Drive **z nagłówkiem `Origin` strony gościa** (bez tego Drive nie daje
   CORS na sessionUri i przeglądarka blokuje PUT-y) i zwraca `uploadUrl`.
4. Klient wysyła plik chunkami po 8 MB `PUT`-em prosto na `uploadUrl`
   (`Content-Range`), z obsługą 308/Range, retry z backoffem i wznowieniem
   po utracie sieci. Kolejka w IndexedDB przeżywa odświeżenie karty.

Nazwy plików: `{YYYYMMDD-HHmm}_{misja}_{imię}_{uuid8}.{ext}`
np. `20260815-2043_negroni_marysia_a3f9c1e2.jpg`. Wszystko w jednym
folderze (`DRIVE_FOLDER_ID`), bez podfolderów.

Ważne: scope `drive.file` widzi tylko pliki utworzone przez aplikację —
dlatego folder docelowy tworzy skrypt tokenowy, nie ręcznie w UI Drive.

## ENV

| zmienna | skąd |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → OAuth client (typ Web) |
| `GOOGLE_CLIENT_SECRET` | jw. |
| `GOOGLE_REFRESH_TOKEN` | `npm run get-token` (patrz niżej) |
| `DRIVE_FOLDER_ID` | wypisany przez `npm run get-token` |
| `ACCESS_CODE` | wymyślony kod dla gości, wchodzi do linku `?k=` |

Lokalne wartości siedzą w `foto/.env.local` (gitignored).

## Refresh token (jednorazowo)

```bash
cd foto && npm run get-token
```

Otwiera przeglądarkę → logujesz się na konto z Drive → skrypt wypisuje
`GOOGLE_REFRESH_TOKEN` i `DRIVE_FOLDER_ID` oraz tworzy folder docelowy.
Jeśli Google nie zwróci refresh_tokena, odwołaj dostęp aplikacji na
<https://myaccount.google.com/permissions> i uruchom ponownie.

## Deploy na Vercel

1. `vercel` w katalogu repo **albo** New Project w dashboardzie z tego
   samego repo, na którym stoi główna stronka.
2. **Root Directory: `foto`** (kluczowe — to podprojekt w repo).
   Framework: Next.js (wykryje sam). Build command domyślny.
3. W Project Settings → Environment Variables wklej wszystkie 5 zmiennych
   z tabelki (Production + Preview).
4. Deploy.

### Subdomena foto.klaraiszymon.pl

1. Vercel: Project Settings → Domains → Add → `foto.klaraiszymon.pl`.
2. U registrara domeny `klaraiszymon.pl` dodaj rekord:
   `foto` → `CNAME` → `cname.vercel-dns.com`.
3. Poczekaj na propagację (zwykle minuty), Vercel sam wystawi certyfikat.

### Po deployu — jedno kliknięcie w Google Cloud

W Google Cloud Console → APIs & Credentials → OAuth client dopisywanie
redirect URI **nie jest potrzebne** (OAuth robimy tylko lokalnie skryptem),
ale upewnij się, że projekt ma włączone **Google Drive API** (przy
generowaniu tokena już działało, więc raczej jest).

## Test bez przeglądarki

```bash
curl -s -X POST https://foto.klaraiszymon.pl/api/upload-session \
  -H 'Content-Type: application/json' \
  -d '{"code":"KOD","fileName":"t.jpg","mimeType":"image/jpeg","size":1234}'
```

Powinno zwrócić `{"uploadUrl":"https://www.googleapis.com/upload/...","driveFileName":"..."}`.
Zły kod → 403.

## Czego tu celowo nie ma

Bazy danych, galerii/feedu, logowania gości, konwersji HEIC, kompresji.
Oryginały, jeden folder, stan gościa w localStorage, kolejka w IndexedDB.
Jeśli Drive zawiedzie: frontend zna tylko interfejs
`createUploadSession(metadata) => { uploadUrl }` z `lib/storage.ts` —
przepięcie na Cloudflare R2 to wymiana jednej implementacji.
