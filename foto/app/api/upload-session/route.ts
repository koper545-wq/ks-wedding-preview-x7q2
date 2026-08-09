import { NextRequest, NextResponse } from 'next/server';
import { createUploadSession } from '@/lib/storage';
import { buildDriveFileName } from '@/lib/filename';

export const runtime = 'nodejs';

const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB

/* Prosty rate limit per IP, w pamięci instancji lambdy. Cold start = czysta
   mapa, więc to miękki limit — wystarczający na wesele, nie na produkt. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

/* Brak ustawionego ACCESS_CODE = bramka wyłączona, wchodzi każdy.
   Żeby ją przywrócić, wystarczy ustawić zmienną i zrobić redeploy. */
function codeOk(code: unknown): boolean {
  const required = process.env.ACCESS_CODE;
  if (!required) return true;
  return typeof code === 'string' && code === required;
}

/* GET /api/upload-session?k=KOD — walidacja kodu dostępu dla bramki na froncie. */
export async function GET(req: NextRequest) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }
  const k = req.nextUrl.searchParams.get('k');
  return NextResponse.json({ ok: codeOk(k) });
}

interface SessionBody {
  code?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  missionId?: string;
  guestName?: string;
}

export async function POST(req: NextRequest) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let body: SessionBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 });
  }

  if (!codeOk(body.code)) {
    return NextResponse.json({ error: 'bad_code' }, { status: 403 });
  }

  const mimeType = typeof body.mimeType === 'string' ? body.mimeType : '';
  if (!/^(image|video)\//.test(mimeType)) {
    return NextResponse.json({ error: 'bad_mime' }, { status: 400 });
  }

  const size = typeof body.size === 'number' ? Math.floor(body.size) : NaN;
  if (!Number.isFinite(size) || size <= 0 || size > MAX_SIZE) {
    return NextResponse.json({ error: 'bad_size' }, { status: 400 });
  }

  const fileName = typeof body.fileName === 'string' ? body.fileName : 'plik';
  const driveFileName = buildDriveFileName({
    missionId: typeof body.missionId === 'string' ? body.missionId : 'wolne',
    guestName: typeof body.guestName === 'string' ? body.guestName : '',
    originalName: fileName,
    mimeType,
  });

  const origin =
    req.headers.get('origin') ?? `https://${req.headers.get('host') ?? ''}`;

  try {
    const session = await createUploadSession({
      fileName: driveFileName,
      mimeType,
      size,
      origin,
    });
    return NextResponse.json({ uploadUrl: session.uploadUrl, driveFileName });
  } catch (e) {
    console.error('upload-session error:', e);
    return NextResponse.json({ error: 'storage_error' }, { status: 502 });
  }
}
