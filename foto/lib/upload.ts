/* Kolejka uploadu po stronie klienta.
   - stan w IndexedDB (idb-keyval) — File jest structured-cloneable, więc
     kolejka przeżywa odświeżenie karty (Safari iOS: bez Background Sync,
     karta musi zostać otwarta)
   - max 2 równoległe uploady
   - chunki po 8 MB (wielokrotność 256 KiB wymagana przez Drive), PUT prosto
     na sessionUri z nagłówkiem Content-Range
   - 308 Resume Incomplete → wznowienie od bajtu z nagłówka Range
   - 401/404/410 → nowy sessionUri z /api/upload-session, upload od zera
   - retry 5 prób, backoff 1s→2s→4s→8s→16s */

import { del, get, keys, set } from 'idb-keyval';

const CHUNK = 8 * 1024 * 1024;
const MAX_SIZE = 2 * 1024 * 1024 * 1024;
const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [1000, 2000, 4000, 8000, 16000];
const IDB_PREFIX = 'ksfoto-q-';

export type ItemStatus = 'queued' | 'uploading' | 'done' | 'error';

export interface QueueItem {
  id: string;
  file: File;
  missionId: string;
  guestName: string;
  size: number;
  /** Bajty potwierdzone przez Drive (nagłówek Range / koniec chunka). */
  confirmed: number;
  /** Bajty w locie (progres XHR w bieżącym chunku) — tylko do UI. */
  sent: number;
  sessionUri: string | null;
  status: ItemStatus;
  driveFileName?: string;
  addedAt: number;
}

export type RejectReason = 'badType' | 'tooBig';

type Listener = () => void;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface ChunkResult {
  status: number;
  range: string | null;
}

function putChunk(
  uri: string,
  body: Blob | null,
  contentRange: string,
  onProgress?: (loaded: number) => void,
): Promise<ChunkResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uri);
    xhr.setRequestHeader('Content-Range', contentRange);
    if (onProgress) {
      xhr.upload.onprogress = (e) => onProgress(e.loaded);
    }
    xhr.onload = () =>
      resolve({ status: xhr.status, range: xhr.getResponseHeader('Range') });
    xhr.onerror = () => reject(new Error('network'));
    xhr.ontimeout = () => reject(new Error('timeout'));
    xhr.send(body);
  });
}

/* "Range: bytes=0-12345" → 12346 (następny bajt do wysłania). */
function nextByteFromRange(range: string | null): number | null {
  const m = range?.match(/bytes=\d+-(\d+)/);
  return m ? parseInt(m[1], 10) + 1 : null;
}

export class UploadQueue {
  private items = new Map<string, QueueItem>();
  private order: string[] = [];
  private listeners = new Set<Listener>();
  private active = new Set<string>();
  private code = '';
  online = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.online = navigator.onLine;
      window.addEventListener('online', () => {
        this.online = true;
        this.emit();
        this.pump();
      });
      window.addEventListener('offline', () => {
        this.online = false;
        this.emit();
      });
    }
  }

  setCode(code: string) {
    this.code = code;
  }

  /** Wczytuje niedokończone uploady z IndexedDB po odświeżeniu karty. */
  async restore() {
    try {
      const allKeys = (await keys()) as string[];
      const mine = allKeys.filter(
        (k) => typeof k === 'string' && k.startsWith(IDB_PREFIX),
      );
      const restored: QueueItem[] = [];
      for (const k of mine) {
        const item = (await get(k)) as QueueItem | undefined;
        if (!item || !(item.file instanceof File)) continue;
        if (item.status === 'done') continue;
        item.status = 'queued';
        item.sent = item.confirmed;
        restored.push(item);
      }
      restored.sort((a, b) => a.addedAt - b.addedAt);
      for (const item of restored) {
        this.items.set(item.id, item);
        this.order.push(item.id);
      }
      this.emit();
      this.pump();
    } catch {
      /* IndexedDB niedostępne (private mode) — kolejka działa tylko w pamięci */
    }
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  snapshot(): QueueItem[] {
    return this.order
      .map((id) => this.items.get(id))
      .filter((i): i is QueueItem => Boolean(i));
  }

  /** Dodaje pliki do kolejki; zwraca odrzucone z powodem. */
  addFiles(
    files: Iterable<File>,
    missionId: string,
    guestName: string,
  ): { added: number; rejected: { file: File; reason: RejectReason }[] } {
    const rejected: { file: File; reason: RejectReason }[] = [];
    let added = 0;
    for (const file of files) {
      if (!/^(image|video)\//.test(file.type)) {
        rejected.push({ file, reason: 'badType' });
        continue;
      }
      if (file.size > MAX_SIZE) {
        rejected.push({ file, reason: 'tooBig' });
        continue;
      }
      const item: QueueItem = {
        id: crypto.randomUUID(),
        file,
        missionId,
        guestName,
        size: file.size,
        confirmed: 0,
        sent: 0,
        sessionUri: null,
        status: 'queued',
        addedAt: Date.now(),
      };
      this.items.set(item.id, item);
      this.order.push(item.id);
      this.persist(item);
      added += 1;
    }
    this.emit();
    this.pump();
    return { added, rejected };
  }

  retry(id: string) {
    const item = this.items.get(id);
    if (!item || item.status !== 'error') return;
    /* Świeży start — stara sesja mogła umrzeć (wygasła / brak CORS). */
    item.sessionUri = null;
    item.confirmed = 0;
    item.sent = 0;
    item.status = 'queued';
    this.persist(item);
    this.emit();
    this.pump();
  }

  get busy(): boolean {
    return this.snapshot().some(
      (i) => i.status === 'queued' || i.status === 'uploading',
    );
  }

  private emit() {
    for (const fn of this.listeners) fn();
  }

  private persist(item: QueueItem) {
    set(IDB_PREFIX + item.id, item).catch(() => {});
  }

  private forget(item: QueueItem) {
    del(IDB_PREFIX + item.id).catch(() => {});
  }

  private pump() {
    if (!this.online) return;
    for (const id of this.order) {
      if (this.active.size >= 2) break;
      const item = this.items.get(id);
      if (!item || item.status !== 'queued' || this.active.has(id)) continue;
      this.active.add(id);
      this.runItem(item).finally(() => {
        this.active.delete(id);
        this.pump();
      });
    }
  }

  private async waitForOnline() {
    while (!this.online) await sleep(1000);
  }

  private async createSession(item: QueueItem): Promise<void> {
    const res = await fetch('/api/upload-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: this.code,
        fileName: item.file.name,
        mimeType: item.file.type,
        size: item.size,
        missionId: item.missionId,
        guestName: item.guestName,
      }),
    });
    if (!res.ok) throw new Error(`session ${res.status}`);
    const data = (await res.json()) as {
      uploadUrl: string;
      driveFileName: string;
    };
    item.sessionUri = data.uploadUrl;
    item.driveFileName = data.driveFileName;
    item.confirmed = 0;
    item.sent = 0;
  }

  /** Pyta Drive, ile bajtów faktycznie dotarło (po błędzie sieci). */
  private async queryOffset(item: QueueItem): Promise<void> {
    if (!item.sessionUri) return;
    const { status, range } = await putChunk(
      item.sessionUri,
      null,
      `bytes */${item.size}`,
    );
    if (status === 308) {
      item.confirmed = nextByteFromRange(range) ?? item.confirmed;
      item.sent = item.confirmed;
    } else if (status === 200 || status === 201) {
      item.confirmed = item.size;
      item.sent = item.size;
    } else if (status === 401 || status === 404 || status === 410) {
      item.sessionUri = null;
    }
  }

  private async runItem(item: QueueItem) {
    item.status = 'uploading';
    this.emit();

    let attempt = 0;
    while (true) {
      await this.waitForOnline();
      try {
        if (!item.sessionUri) await this.createSession(item);

        while (item.confirmed < item.size) {
          await this.waitForOnline();
          const start = item.confirmed;
          const end = Math.min(start + CHUNK, item.size);
          const blob = item.file.slice(start, end);
          const { status, range } = await putChunk(
            item.sessionUri!,
            blob,
            `bytes ${start}-${end - 1}/${item.size}`,
            (loaded) => {
              item.sent = start + loaded;
              this.emit();
            },
          );

          if (status === 308) {
            /* Range bywa nieczytelny przez CORS — wtedy zakładamy, że chunk
               doszedł w całości; rozjazd wykryje queryOffset przy błędzie. */
            item.confirmed = nextByteFromRange(range) ?? end;
            item.sent = item.confirmed;
            attempt = 0;
            this.persist(item);
            this.emit();
          } else if (status === 200 || status === 201) {
            item.confirmed = item.size;
            item.sent = item.size;
            item.status = 'done';
            this.forget(item);
            this.emit();
            return;
          } else if (status === 401 || status === 404 || status === 410) {
            item.sessionUri = null;
            throw new Error(`session lost ${status}`);
          } else {
            throw new Error(`chunk ${status}`);
          }
        }

        /* confirmed === size, ale nie było 200 — dopytaj o status. */
        await this.queryOffset(item);
        if (item.confirmed >= item.size) {
          item.status = 'done';
          this.forget(item);
          this.emit();
          return;
        }
        throw new Error('incomplete');
      } catch {
        attempt += 1;
        if (attempt >= MAX_ATTEMPTS) {
          item.status = 'error';
          this.persist(item);
          this.emit();
          return;
        }
        await sleep(BACKOFF_MS[attempt - 1]);
        if (item.sessionUri) {
          try {
            await this.queryOffset(item);
          } catch {
            /* offset nieznany — spróbujemy od item.confirmed */
          }
        }
      }
    }
  }
}

let queue: UploadQueue | null = null;

export function getUploadQueue(): UploadQueue {
  if (!queue) queue = new UploadQueue();
  return queue;
}
