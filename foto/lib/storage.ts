/* Cienka warstwa abstrakcji nad backendem plików.
   Frontend zna wyłącznie ten interfejs — podmiana Drive na np. Cloudflare R2
   to zmiana jednej implementacji tutaj. */

import { createDriveResumableSession } from './drive';

export interface UploadMetadata {
  /** Docelowa nazwa pliku w magazynie (już zbudowana, ze slugami). */
  fileName: string;
  mimeType: string;
  size: number;
  /** Origin strony, z której klient będzie słał chunki (wymóg CORS Drive). */
  origin: string;
}

export interface UploadSession {
  /** URL, na który klient wysyła plik chunkami metodą PUT + Content-Range. */
  uploadUrl: string;
}

export async function createUploadSession(
  metadata: UploadMetadata,
): Promise<UploadSession> {
  const uploadUrl = await createDriveResumableSession({
    name: metadata.fileName,
    mimeType: metadata.mimeType,
    size: metadata.size,
    origin: metadata.origin,
  });
  return { uploadUrl };
}
