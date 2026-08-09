'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import missionsData from '@/data/missions.json';
import { getStrings, type Lang } from '@/lib/i18n';
import { local } from '@/lib/local';
import { getUploadQueue, type QueueItem } from '@/lib/upload';
import LangToggle from './LangToggle';
import Missions, { type Mission } from './Missions';
import NameScreen from './NameScreen';
import Queue from './Queue';

type GateState = 'checking' | 'ok' | 'bad';

const MISSIONS = missionsData as Mission[];

export default function App({ urlCode }: { urlCode: string | null }) {
  const [lang, setLang] = useState<Lang>('pl');
  const [gate, setGate] = useState<GateState>('checking');
  const [name, setName] = useState<string | null>(null);
  const [asked, setAsked] = useState(false);
  const [doneMissions, setDoneMissions] = useState<string[]>([]);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [online, setOnline] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const queueRef = useRef<ReturnType<typeof getUploadQueue> | null>(null);

  const t = useMemo(() => getStrings(lang), [lang]);

  useEffect(() => {
    setLang(local.getLang());
    const storedName = local.getName();
    if (storedName !== null) {
      setName(storedName);
      setAsked(true);
    }
    setDoneMissions(local.getDoneMissions());

    const queue = getUploadQueue();
    queueRef.current = queue;

    const unsubscribe = queue.subscribe(() => {
      const snap = queue.snapshot();
      setItems([...snap]);
      setOnline(queue.online);
      let done = local.getDoneMissions();
      let changed = false;
      for (const item of snap) {
        if (
          item.status === 'done' &&
          item.missionId !== 'wolne' &&
          !done.includes(item.missionId)
        ) {
          done = local.markMissionDone(item.missionId);
          changed = true;
        }
      }
      if (changed) setDoneMissions([...done]);
    });

    const code = urlCode ?? local.getCode() ?? '';
    fetch(`/api/upload-session?k=${encodeURIComponent(code)}`)
      .then((res) => res.json())
      .then((data: { ok: boolean }) => {
        if (data.ok) {
          local.setCode(code);
          queue.setCode(code);
          setGate('ok');
          queue.restore();
        } else {
          setGate('bad');
        }
      })
      .catch(() => setGate('bad'));

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Ostrzeżenie przed zamknięciem karty w trakcie wysyłania. */
  useEffect(() => {
    const busy = items.some(
      (i) => i.status === 'queued' || i.status === 'uploading',
    );
    if (!busy) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [items]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const changeLang = (l: Lang) => {
    setLang(l);
    local.setLang(l);
  };

  const handleFiles = (files: File[], missionId: string) => {
    const queue = queueRef.current;
    if (!queue) return;
    const { rejected } = queue.addFiles(files, missionId, name ?? '');
    if (rejected.length > 0) {
      setToast(t.errors[rejected[0].reason === 'tooBig' ? 'tooBig' : 'badType']);
    }
  };

  const container: React.CSSProperties = {
    maxWidth: 680,
    margin: '0 auto',
    paddingLeft: 'var(--pad-x)',
    paddingRight: 'var(--pad-x)',
  };

  const header = (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 18,
        paddingBottom: 14,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="k & s" style={{ height: 26, width: 'auto' }} />
      <LangToggle lang={lang} onChange={changeLang} />
    </header>
  );

  if (gate === 'checking') {
    return (
      <div style={container}>
        {header}
        <div className="rule-h" />
      </div>
    );
  }

  if (gate === 'bad') {
    return (
      <div style={container}>
        {header}
        <div className="rule-h" />
        <section className="fade-in" style={{ paddingTop: 72, paddingBottom: 96 }}>
          <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: 20 }}>
            {t.gate.kicker}
          </div>
          <h1
            className="display"
            style={{ fontSize: 'clamp(40px, 9vw, 76px)', marginBottom: 28 }}
            dangerouslySetInnerHTML={{ __html: t.gate.title }}
          />
          <p style={{ color: 'var(--muted)', maxWidth: 420, margin: 0 }}>
            {t.gate.body}
          </p>
        </section>
      </div>
    );
  }

  const uploadBar = (
    <Queue
      t={t}
      items={items}
      online={online}
      onRetry={(id) => queueRef.current?.retry(id)}
    />
  );

  if (!asked) {
    return (
      <>
        {uploadBar}
        <div style={container}>
          {header}
          <div className="rule-h" />
          <NameScreen
          t={t}
            onDone={(n) => {
              local.setName(n);
              setName(n);
              setAsked(true);
            }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {uploadBar}
      <div style={container}>
        {header}
        <div className="rule-h" />

      <section className="fade-in" style={{ paddingTop: 56 }}>
        <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: 20 }}>
          {t.home.kicker}
        </div>
        <h1
          className="display"
          style={{ fontSize: 'clamp(44px, 10vw, 88px)', marginBottom: 20 }}
          dangerouslySetInnerHTML={{ __html: t.home.title }}
        />
        <p style={{ color: 'var(--muted)', maxWidth: 460, margin: '0 0 12px' }}>
          {t.home.subtitle}
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 12, maxWidth: 460, margin: '0 0 28px' }}>
          {t.home.privacy}
        </p>

        {name !== null && (
          <div
            className="smallcaps"
            style={{
              color: 'var(--muted)',
              marginBottom: 28,
              display: 'flex',
              gap: 10,
              alignItems: 'baseline',
              flexWrap: 'wrap',
            }}
          >
            {name ? <span>{t.home.greeting(name)}</span> : null}
            <button
              type="button"
              onClick={() => setAsked(false)}
              className="smallcaps"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--rule-strong)',
                cursor: 'pointer',
                padding: '4px 0',
                fontSize: 10,
                color: 'var(--muted)',
              }}
            >
              {t.home.changeName}
            </button>
          </div>
        )}

        <Missions
          t={t}
          lang={lang}
          missions={MISSIONS}
          doneMissions={doneMissions}
          onFiles={handleFiles}
        />
      </section>

      <footer style={{ marginTop: 96, paddingBottom: 48 }}>
        <div className="rule-h" />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            paddingTop: 18,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span className="smallcaps" style={{ fontSize: 10, color: 'var(--muted)' }}>
            k &amp; s · 15.08.2026
          </span>
          <span className="smallcaps" style={{ fontSize: 10, color: 'var(--muted)' }}>
            wrocław golf club
          </span>
        </div>
      </footer>

      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 84,
            transform: 'translateX(-50%)',
            background: 'var(--ink)',
            color: 'var(--cream)',
            padding: '12px 20px',
            fontSize: 13,
            zIndex: 20,
            maxWidth: 'calc(100vw - 36px)',
          }}
        >
          {toast}
        </div>
      )}
      </div>
    </>
  );
}
