/* Sortowanie zdjęć na Drive do podfolderów wg godziny ZROBIENIA (EXIF),
   nie wrzucenia. Uruchamiaj kiedy chcesz — jest idempotentne (rusza tylko
   pliki leżące luzem w folderze głównym; posortowanych nie dotyka).

   Użycie:
     npm run sort            → podgląd (nic nie przenosi)
     npm run sort -- --apply → naprawdę przenosi

   Zdjęcia bez EXIF-u (np. przesłane wcześniej przez komunikator) i wideo
   (Drive nie wystawia daty nagrania) wpadają wg czasu wrzucenia. */

import { readFileSync } from 'node:fs';
import { google } from 'googleapis';

const APPLY = process.argv.includes('--apply');

/* Przedziały wg planu dnia — czas lokalny (Europe/Warsaw), [od, do). */
const BUCKETS = [
  { name: '01 — cocktail (sb 15–16)',        from: '2026-08-15T15:00', to: '2026-08-15T16:00' },
  { name: '02 — ceremonia (sb 16–17)',       from: '2026-08-15T16:00', to: '2026-08-15T17:00' },
  { name: '03 — wieczór (sb 17–22)',         from: '2026-08-15T17:00', to: '2026-08-15T22:00' },
  { name: '04 — late night (sb 22 – nd 04)', from: '2026-08-15T22:00', to: '2026-08-16T04:00' },
  { name: '05 — poprawiny (nd 12+)',         from: '2026-08-16T12:00', to: '2026-08-17T00:00' },
];
const OTHER = '00 — pozostałe';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .trim().split('\n').filter((l) => l.includes('='))
    .map((l) => l.split(/=(.*)/s).slice(0, 2)),
);
const auth = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });
const drive = google.drive({ version: 'v3', auth });
const ROOT = env.DRIVE_FOLDER_ID;

/* "2026:08:15 20:43:12" (EXIF, czas lokalny aparatu) → "2026-08-15T20:43" */
function fromExif(t) {
  const m = t?.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}` : null;
}

/* ISO UTC (createdTime) → naiwny czas warszawski "YYYY-MM-DDTHH:mm" */
function fromUpload(iso) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

function bucketFor(stamp) {
  const b = BUCKETS.find((b) => stamp >= b.from && stamp < b.to);
  return b ? b.name : OTHER;
}

/* Wszystkie dzieci folderu głównego (z paginacją). */
const children = [];
let pageToken;
do {
  const { data } = await drive.files.list({
    q: `'${ROOT}' in parents and trashed=false`,
    fields: 'nextPageToken, files(id,name,mimeType,createdTime,imageMediaMetadata(time))',
    pageSize: 1000,
    pageToken,
  });
  children.push(...data.files);
  pageToken = data.nextPageToken;
} while (pageToken);

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const folderIds = new Map(
  children.filter((f) => f.mimeType === FOLDER_MIME).map((f) => [f.name, f.id]),
);
const files = children.filter((f) => f.mimeType !== FOLDER_MIME);

async function folderId(name) {
  if (folderIds.has(name)) return folderIds.get(name);
  const { data } = await drive.files.create({
    requestBody: { name, mimeType: FOLDER_MIME, parents: [ROOT] },
    fields: 'id',
  });
  folderIds.set(name, data.id);
  return data.id;
}

console.log(`${APPLY ? 'PRZENOSZĘ' : 'PODGLĄD (dodaj --apply, żeby przenieść)'} — plików luzem: ${files.length}\n`);

const perBucket = new Map();
for (const f of files) {
  const exif = fromExif(f.imageMediaMetadata?.time);
  const stamp = exif ?? fromUpload(f.createdTime);
  const bucket = bucketFor(stamp);
  perBucket.set(bucket, (perBucket.get(bucket) ?? 0) + 1);
  console.log(`${f.name}  →  ${bucket}   [${exif ? 'EXIF ' + stamp : 'upload ' + stamp + ' (brak EXIF)'}]`);
  if (APPLY) {
    await drive.files.update({
      fileId: f.id,
      addParents: await folderId(bucket),
      removeParents: ROOT,
    });
  }
}

console.log('\nPodsumowanie:');
for (const [name, n] of [...perBucket].sort()) console.log(`  ${name}: ${n}`);
