/* Jednorazowy skrypt: wymienia zgodę OAuth na refresh_token.
   Uruchom: npm run get-token (w katalogu foto/).
   Po zalogowaniu w przeglądarce wypisuje refresh_token i tworzy folder
   docelowy na Drive (scope drive.file widzi tylko foldery utworzone przez
   tę aplikację, więc ręcznie utworzony folder by nie zadziałał). */

import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { google } from 'googleapis';

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_NAME = 'wesele — zdjęcia gości — 15.08.2026';

const { web } = JSON.parse(readFileSync(new URL('../oauth_client.json', import.meta.url), 'utf8'));
const oauth2 = new google.auth.OAuth2(web.client_id, web.client_secret, REDIRECT_URI);

const authUrl = oauth2.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: SCOPES,
});

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== '/oauth2callback') {
    res.writeHead(404).end();
    return;
  }

  const err = url.searchParams.get('error');
  const code = url.searchParams.get('code');
  if (err || !code) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Autoryzacja nieudana: ${err || 'brak kodu'}`);
    console.error('Autoryzacja nieudana:', err || 'brak kodu');
    process.exit(1);
  }

  try {
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error('Google nie zwrócił refresh_token — usuń dostęp aplikacji na https://myaccount.google.com/permissions i uruchom skrypt ponownie.');
    }
    oauth2.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2 });
    const folder = await drive.files.create({
      requestBody: { name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id',
    });

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<p style="font-family:sans-serif">Gotowe — wróć do terminala. Tę kartę możesz zamknąć.</p>');

    console.log('\nWklej do foto/.env.local:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`DRIVE_FOLDER_ID=${folder.data.id}`);
    console.log(`\n(folder "${FOLDER_NAME}" został utworzony na Twoim Drive)`);
    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Błąd wymiany kodu na tokeny: ${e.message}`);
    console.error(e);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`Czekam na autoryzację na ${REDIRECT_URI} …`);
  console.log(`Jeśli przeglądarka się nie otworzy, wejdź ręcznie:\n${authUrl}\n`);
  spawn('open', [authUrl], { stdio: 'ignore', detached: true }).unref();
});
