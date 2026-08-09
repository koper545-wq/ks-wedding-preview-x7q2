/* Budowanie nazw plików w Drive:
   {YYYYMMDD-HHmm}_{slug-misji}_{slug-imienia}_{uuid8}.{ext}
   np. 20260815-2043_negroni_marysia_a3f9c1e2.jpg */

const PL_MAP: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};

export function slugify(input: string, fallback = ''): string {
  const slug = input
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => PL_MAP[ch] ?? ch)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || fallback;
}

function warsawStamp(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}${get('month')}${get('day')}-${get('hour')}${get('minute')}`;
}

const EXT_FROM_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-matroska': 'mkv',
};

function extensionFor(originalName: string, mimeType: string): string {
  const fromName = originalName.match(/\.([A-Za-z0-9]{1,5})$/)?.[1]?.toLowerCase();
  return fromName ?? EXT_FROM_MIME[mimeType.toLowerCase()] ?? 'bin';
}

export function buildDriveFileName(opts: {
  missionId: string;
  guestName: string;
  originalName: string;
  mimeType: string;
}): string {
  const uuid8 = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  const mission = slugify(opts.missionId, 'wolne');
  const guest = slugify(opts.guestName, 'gosc');
  const ext = extensionFor(opts.originalName, opts.mimeType);
  return `${warsawStamp()}_${mission}_${guest}_${uuid8}.${ext}`;
}
