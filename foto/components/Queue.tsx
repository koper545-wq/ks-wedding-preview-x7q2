'use client';

import type { Strings } from '@/lib/i18n';
import type { QueueItem } from '@/lib/upload';

function percent(sent: number, size: number): number {
  if (size <= 0) return 0;
  return Math.min(100, Math.round((sent / size) * 100));
}

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

  const busy = items.some((i) => i.status === 'queued' || i.status === 'uploading');
  const totalSize = items.reduce((s, i) => s + i.size, 0);
  const totalSent = items.reduce((s, i) => s + Math.min(i.sent, i.size), 0);
  const totalPct = percent(totalSent, totalSize);

  const statusLabel = (item: QueueItem): string => {
    switch (item.status) {
      case 'done':
        return `${t.queue.done} ✓`;
      case 'error':
        return t.queue.failed;
      case 'uploading':
        return online ? `${percent(item.sent, item.size)}%` : t.queue.paused;
      default:
        return t.queue.waiting;
    }
  };

  return (
    <>
      <section style={{ marginTop: 72, paddingBottom: busy ? 96 : 0 }}>
        <div className="rule-h" />
        <div style={{ paddingTop: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 20,
            }}
          >
            <span className="smallcaps" style={{ color: 'var(--muted)' }}>
              {t.queue.kicker}
            </span>
            <span className="smallcaps" style={{ color: 'var(--ink)' }}>
              {t.queue.total} {totalPct}%
            </span>
          </div>

          <div className="progress-track" style={{ marginBottom: 24 }}>
            <div className="progress-fill" style={{ width: `${totalPct}%` }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {items.map((item) => (
              <div key={item.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 16,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 11,
                      letterSpacing: '0.04em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: item.status === 'done' ? 'var(--muted)' : 'var(--ink)',
                    }}
                  >
                    {item.file.name}
                  </span>
                  <span
                    className="smallcaps"
                    style={{
                      fontSize: 10,
                      whiteSpace: 'nowrap',
                      color: item.status === 'error' ? 'var(--ink)' : 'var(--muted)',
                    }}
                  >
                    {statusLabel(item)}
                    {item.status === 'error' && (
                      <button
                        type="button"
                        onClick={() => onRetry(item.id)}
                        className="smallcaps"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--ink)',
                          cursor: 'pointer',
                          marginLeft: 12,
                          padding: '4px 0',
                          fontSize: 10,
                          color: 'var(--ink)',
                        }}
                      >
                        {t.queue.retry}
                      </button>
                    )}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percent(item.sent, item.size)}%`,
                      opacity: item.status === 'done' ? 0.35 : 1,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(busy || !online) && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--cream)',
            borderTop: '1px solid var(--rule)',
            padding: '14px var(--pad-x)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            zIndex: 10,
          }}
        >
          <span className="smallcaps" style={{ fontSize: 10, color: 'var(--muted)' }}>
            {online ? t.queue.keepOpen : t.queue.offline}
          </span>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--ink)',
              whiteSpace: 'nowrap',
            }}
          >
            {totalPct}%
          </span>
        </div>
      )}
    </>
  );
}
