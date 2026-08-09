/* Awaryjna wymiana kodu OAuth wklejonego ręcznie (gdy callback nie trafił
   w działający serwer get-token.mjs). Użycie: node scripts/exchange-code.mjs <code>
   Zapisuje refresh_token i id folderu wprost do .env.local. */

import { readFileSync, writeFileSync } from 'node:fs';
import { google } from 'googleapis';

const code = process.argv[2];
if (!code) {
  console.error('Użycie: node scripts/exchange-code.mjs <code>');
  process.exit(1);
}

const { web } = JSON.parse(readFileSync(new URL('../oauth_client.json', import.meta.url), 'utf8'));
const oauth2 = new google.auth.OAuth2(web.client_id, web.client_secret, 'http://localhost:3000/oauth2callback');

const { tokens } = await oauth2.getToken(code);
if (!tokens.refresh_token) {
  console.error('Google nie zwrócił refresh_token — usuń dostęp aplikacji na https://myaccount.google.com/permissions i uruchom npm run get-token jeszcze raz.');
  process.exit(1);
}
oauth2.setCredentials(tokens);

const drive = google.drive({ version: 'v3', auth: oauth2 });
const folder = await drive.files.create({
  requestBody: { name: 'wesele — zdjęcia gości — 15.08.2026', mimeType: 'application/vnd.google-apps.folder' },
  fields: 'id',
});

const envPath = new URL('../.env.local', import.meta.url);
const env = readFileSync(envPath, 'utf8')
  .replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
  .replace(/^DRIVE_FOLDER_ID=.*$/m, `DRIVE_FOLDER_ID=${folder.data.id}`);
writeFileSync(envPath, env);

console.log(`OK — refresh_token i DRIVE_FOLDER_ID=${folder.data.id} zapisane w .env.local`);
