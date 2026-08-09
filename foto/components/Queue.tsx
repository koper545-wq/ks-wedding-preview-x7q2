'use client';

import type { Strings } from '@/lib/i18n';
import type { QueueItem } from '@/lib/upload';

function percent(sent: number, size: number): number {
  if (size <= 0) return 0;
  return Math.min(100, Math.round((sent / size) * 100));
}

const STATUS_ORDER: Record<string, number> = {
  error: 0,
  uploading: 1,
  queued: 2,
};

/* Przyklejony do góry, kompaktowy pasek wysyłki: max 3 pliki + "+N w kolejce".
   Skończone pliki zwijają się do licznika ✓ w nagłówku paska. */
export default function Queue({
  t,
  items,
  online,
  onRetry,
}: {
  t: Strings;
  items: QueueItem[];
  online: boolean;
  onRetry: (id: string) => void;
}) {
  if (items.length === 0) return null;

  const doneCount = items.filter((i) => i.status === 'done').length;
  const active = items.filter((i) => i.status !== 'done');
  const busy = active.some((i) => i.status === 'queued' || i.status === 'uploading');
  const totalSize = items.reduce((s, i) => s + i.size, 0);
  const totalSent = items.reduce((s, i) => s + Math.min(i.sent, i.size), 0);
  const totalPct = percent(totalSent, totalSize);

  const rows = [...active]
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3))
    .slice(0, 3);
  const extra = active.length - rows.length;

  const headerLeft = !online
    ? t.queue.offline
    : busy
      ? t.queue.keepOpen
      : t.queue.allSent(doneCount);

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'var(--cream)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '10px var(--pad-x) 12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
          }}
        >
          <span
            className="smallcaps"
            style={{
              fontSize: 9,
              color: 'var(--muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {headerLeft}
          </span>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: 'var(--ink)',
              whiteSpace: 'nowrap',
            }}
          >
            {busy ? `${totalPct}%` : '✓'}
            {doneCount > 0 && busy ? ` · ${doneCount} ✓` : ''}
          </span>
        </div>

        {busy && (
          <div className="progress-track" style={{ marginTop: 6 }}>
            <div className="progress-fill" style={{ width: `${totalPct}%` }} />
          </div>
        )}

        {rows.map((item) => (
          <div key={item.id} style={{ marginTop: 7 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  letterSpacing: '0.03em',
                  color: 'var(--muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.file.name}
              </span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  whiteSpace: 'nowrap',
                  color: item.status === 'error' ? 'var(--ink)' : 'var(--muted)',
                }}
              >
                {item.status === 'error' ? (
                  <button
                    type="button"
                    onClick={() => onRetry(item.id)}
                    className="smallcaps"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--ink)',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 9,
                      color: 'var(--ink)',
                    }}
                  >
                    {t.queue.failed} — {t.queue.retry}
                  </button>
                ) : item.status === 'uploading' && online ? (
                  `${percent(item.sent, item.size)}%`
                ) : (
                  t.queue.waiting
                )}
              </span>
            </div>
            <div className="progress-track" style={{ marginTop: 3, height: 1 }}>
              <div
                className="progress-fill"
                style={{ width: `${percent(item.sent, item.size)}%` }}
              />
            </div>
          </div>
        ))}

        {extra > 0 && (
          <div
            className="smallcaps"
            style={{ fontSize: 9, color: 'var(--muted)', marginTop: 7 }}
          >
            {t.queue.inQueue(extra)}
          </div>
        )}
      </div>
    </div>
  );
}
