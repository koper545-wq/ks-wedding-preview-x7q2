'use client';

import type { Lang } from '@/lib/i18n';

export default function LangToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {(['pl', 'en'] as Lang[]).map((l, i) => (
        <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {i > 0 && <span style={{ color: 'var(--rule-strong)' }}>/</span>}
          <button
            type="button"
            onClick={() => onChange(l)}
            className="smallcaps"
            aria-pressed={lang === l}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 6px',
              color: lang === l ? 'var(--ink)' : 'var(--muted)',
              borderBottom: `1px solid ${lang === l ? 'var(--ink)' : 'transparent'}`,
            }}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
