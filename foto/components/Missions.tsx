'use client';

import { useRef, useState } from 'react';
import type { Lang, Strings } from '@/lib/i18n';

export interface Mission {
  id: string;
  pl: string;
  en: string;
}

export default function Missions({
  t,
  lang,
  missions,
  doneMissions,
  onFiles,
}: {
  t: Strings;
  lang: Lang;
  missions: Mission[];
  doneMissions: string[];
  onFiles: (files: File[], missionId: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingMission, setPendingMission] = useState('wolne');

  const pick = (missionId: string) => {
    setPendingMission(missionId);
    /* setState jest asynchroniczny, a click() natychmiastowy — przekazujemy
       misję też przez dataset, żeby onChange czytał aktualną wartość. */
    if (inputRef.current) {
      inputRef.current.dataset.mission = missionId;
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const doneCount = missions.filter((m) => doneMissions.includes(m.id)).length;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) {
            onFiles(files, e.target.dataset.mission ?? pendingMission);
          }
          e.target.value = '';
        }}
      />

      <button type="button" className="big-upload" onClick={() => pick('wolne')}>
        <span className="mission-label serif">{t.home.freeUpload}</span>
        <span
          className="smallcaps"
          style={{ fontSize: 10, color: 'rgba(255, 252, 240, 0.65)' }}
        >
          {t.home.freeUploadSub}
        </span>
      </button>

      <section style={{ marginTop: 72 }}>
        <div className="rule-h" />
        <div style={{ paddingTop: 28 }}>
          <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: 16 }}>
            {t.home.missionsKicker}
          </div>
          <h2
            className="display"
            style={{ fontSize: 'clamp(30px, 6vw, 48px)', marginBottom: 10 }}
            dangerouslySetInnerHTML={{ __html: t.home.missionsTitle }}
          />
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 26px' }}>
            {t.home.missionsHint}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 26,
            }}
          >
            <span
              className="smallcaps"
              style={{ color: 'var(--ink)', whiteSpace: 'nowrap' }}
            >
              {t.home.progress(doneCount, missions.length)}
            </span>
            <div className="progress-track" style={{ flex: 1 }}>
              <div
                className="progress-fill"
                style={{ width: `${(doneCount / missions.length) * 100}%` }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {missions.map((m, i) => {
              const done = doneMissions.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`mission-row${done ? ' is-done' : ''}`}
                  onClick={() => pick(m.id)}
                >
                  <span className="mission-index">
                    {String.fromCharCode(97 + i)}.
                  </span>
                  <span className="mission-label">{m[lang]}</span>
                  <span
                    className="smallcaps"
                    style={{
                      fontSize: 10,
                      color: done ? 'var(--ink)' : 'var(--muted)',
                    }}
                  >
                    {done ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
