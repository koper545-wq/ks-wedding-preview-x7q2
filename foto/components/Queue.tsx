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

/* Kolory na ciemnym pasku (atrament + krem, jak przycisk "wrzuć cokolwiek") */
const CREAM_FULL = 'var(--cream)';
const CREAM_SOFT = 'rgba(255, 252, 240, 0.72)';
const CREAM_TRACK = 'rgba(255, 252, 240, 0.25)';

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

  const track: React.CSSProperties = {
    height: 2,
    width: '100%',
    background: CREAM_TRACK,
    overflow: 'hidden',
  };
  const fill = (pct: number): React.CSSProperties => ({
    height: '100%',
    width: `${pct}%`,
    background: CREAM_FULL,
    transition: 'width 300ms ease',
  });

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'var(--ink)',
        color: CREAM_FULL,
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
              color: busy || !online ? CREAM_FULL : CREAM_SOFT,
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
              color: CREAM_FULL,
              whiteSpace: 'nowrap',
            }}
          >
            {busy ? `${totalPct}%` : '✓'}
            {doneCount > 0 && busy ? ` · ${doneCount} ✓` : ''}
          </span>
        </div>

        {busy && (
          <div style={{ ...track, marginTop: 6 }}>
            <div style={fill(totalPct)} />
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
                  color: CREAM_SOFT,
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
                  color: CREAM_FULL,
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
                      borderBottom: `1px solid ${CREAM_FULL}`,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 9,
                      color: CREAM_FULL,
                    }}
                  >
                    {t.queue.failed} — {t.queue.retry}
                  </button>
                ) : item.status === 'uploading' && online ? (
                  `${percent(item.sent, item.size)}%`
                ) : (
                  <span style={{ color: CREAM_SOFT }}>{t.queue.waiting}</span>
                )}
              </span>
            </div>
            <div style={{ ...track, height: 1, marginTop: 3 }}>
              <div style={fill(percent(item.sent, item.size))} />
            </div>
          </div>
        ))}

        {extra > 0 && (
          <div
            className="smallcaps"
            style={{ fontSize: 9, color: CREAM_SOFT, marginTop: 7 }}
          >
            {t.queue.inQueue(extra)}
          </div>
        )}
      </div>
    </div>
  );
}
