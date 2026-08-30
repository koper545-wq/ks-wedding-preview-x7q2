/* Wspólne prymitywy UI — używane przez sections.jsx i rsvp.jsx */

/* <em> w tekstach z content.jsx dostaje kursywę */
function Rich({ html, as = 'span', style, className }) {
  const Tag = as;
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Kicker({ children, style }) {
  return <div className="smallcaps" style={{ color: 'var(--muted)', ...style }}>{children}</div>;
}

/* Sekcja: numer + hairline u góry, tytuł wersalikami (Bona Nova SC) */
function Section({ id, kicker, title, children }) {
  return (
    <section id={id} style={{ padding: '88px var(--pad-x)', borderTop: '1px solid var(--rule)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 36 }}>
          <Kicker>{kicker}</Kicker>
          <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        </header>

        <Rich as="h2" html={title} style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 'clamp(42px, 6.5vw, 84px)',
          lineHeight: 1.02,
          letterSpacing: '0.005em',
          textTransform: 'uppercase',
          color: 'var(--fg-strong)',
          margin: '0 0 44px',
        }} />

        {children}
      </div>
    </section>
  );
}

/* Wiersz faktu: etykieta | wartość | podpis */
function FactRow({ label, value, sub, last }) {
  return (
    <div className="stack-mobile-tight" style={{
      display: 'grid',
      gridTemplateColumns: '150px 1fr',
      gap: 24,
      padding: '22px 0',
      borderBottom: last ? 'none' : '1px solid var(--rule)',
      alignItems: 'baseline',
    }}>
      <div className="smallcaps" style={{ color: 'var(--muted)' }}>{label}</div>
      <div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8, lineHeight: 1.55 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── Odliczanie ────────────────────────────────────────────────────────── */

function useCountdown(targetIso) {
  const target = React.useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const calc = React.useCallback(() => {
    const diff = Math.max(0, target - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60),
      done: diff === 0,
    };
  }, [target]);

  const [t, setT] = React.useState(calc);
  React.useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return t;
}

function CountdownCell({ big, label }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 58 }}>
      <div style={{
        fontFamily: 'var(--serif)',
        fontSize: 'clamp(26px, 4.5vw, 40px)',
        lineHeight: 1,
        color: 'var(--fg-strong)',
      }}>
        {String(big).padStart(2, '0')}
      </div>
      <div className="smallcaps" style={{ color: 'var(--muted)', marginTop: 10, fontSize: 10 }}>{label}</div>
    </div>
  );
}

function Countdown() {
  const t = useCountdown(EVENT.dateISO);
  if (t.done) return null;
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <CountdownCell big={t.d} label="dni" />
      <CountdownCell big={t.h} label="godz" />
      <CountdownCell big={t.m} label="min" />
      <CountdownCell big={t.s} label="sek" />
    </div>
  );
}

/* Przycisk główny — kremowe wypełnienie na zieleni, jak akcenty z zaproszenia */
function Button({ children, onClick, disabled, type = 'button', style }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      background: disabled ? 'transparent' : 'var(--fg)',
      color: disabled ? 'var(--muted)' : 'var(--bg)',
      border: '1px solid ' + (disabled ? 'var(--rule-strong)' : 'var(--fg)'),
      borderRadius: 999,
      padding: '16px 30px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'var(--sans)',
      fontSize: 11,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      ...style,
    }}>
      {children}
    </button>
  );
}

Object.assign(window, { Rich, Kicker, Section, FactRow, Countdown, useCountdown, Button });
