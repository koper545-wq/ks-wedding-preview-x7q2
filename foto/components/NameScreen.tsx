'use client';

import { useState } from 'react';
import type { Strings } from '@/lib/i18n';

export default function NameScreen({
  t,
  onDone,
}: {
  t: Strings;
  onDone: (name: string) => void;
}) {
  const [value, setValue] = useState('');

  const submit = () => onDone(value.trim());

  return (
    <section className="fade-in" style={{ paddingTop: 72, paddingBottom: 96 }}>
      <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: 20 }}>
        {t.name.kicker}
      </div>
      <h1
        className="display"
        style={{ fontSize: 'clamp(40px, 9vw, 76px)', marginBottom: 36 }}
        dangerouslySetInnerHTML={{ __html: t.name.title }}
      />
      <input
        className="input-line"
        type="text"
        value={value}
        placeholder={t.name.placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        maxLength={40}
        autoComplete="given-name"
      />
      <p style={{ color: 'var(--muted)', fontSize: 13, margin: '14px 0 36px' }}>
        {t.name.hint}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button type="button" className="btn-solid" onClick={submit}>
          {t.name.submit}
        </button>
        <button type="button" className="btn-ghost" onClick={() => onDone('')}>
          {t.name.skip}
        </button>
      </div>
    </section>
  );
}
