/* Integracja z Google Drive — wyłącznie po stronie serwera.
   Refresh token nigdy nie opuszcza tego modułu; klient dostaje tylko
   sessionUri konkretnego pliku. */

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const RESUMABLE_URL =
  'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.value;
}

export interface DriveSessionInput {
  name: string;
  mimeType: string;
  size: number;
  /** Origin strony gościa — Drive zwraca nagłówki CORS na sessionUri tylko
      wtedy, gdy inicjacja sesji niosła ten sam Origin. Bez tego przeglądarka
      zablokuje PUT-y chunków. */
  origin: string;
}

export async function createDriveResumableSession(
  input: DriveSessionInput,
): Promise<string> {
  const token = await getAccessToken();

  const res = await fetch(RESUMABLE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': input.mimeType,
      'X-Upload-Content-Length': String(input.size),
      Origin: input.origin,
    },
    body: JSON.stringify({
      name: input.name,
      parents: [process.env.DRIVE_FOLDER_ID!],
    }),
  });

  if (!res.ok) {
    throw new Error(`Drive session init failed: ${res.status} ${await res.text()}`);
  }

  const location = res.headers.get('location');
  if (!location) {
    throw new Error('Drive did not return a session URI (Location header)');
  }
  return location;
}
