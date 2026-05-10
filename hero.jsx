/* Hero – Feature variant: one big B&W photo + editorial typographic block */

const heroStyles = {
  wrap: {
    position: 'relative',
    width: '100%',
    paddingTop: 40,
    paddingBottom: 64,
    paddingLeft: 'var(--pad-x)',
    paddingRight: 'var(--pad-x)',
    overflow: 'hidden',
  },
  cornerLabel: {
    fontFamily: 'var(--sans)',
    fontSize: 10,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
  },
};

function Monogram({ size = 28 }) {
  return (
    <span style={{
      fontFamily: 'var(--serif)',
      fontSize: size,
      letterSpacing: '-0.06em',
      lineHeight: 1,
      fontWeight: 400,
      color: 'var(--ink)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.08,
    }}>
      <span>k</span>
      <span style={{ fontSize: size * 0.55, transform: `translateY(-${size * 0.08}px)`, opacity: 0.85 }}>·</span>
      <span style={{ fontStyle: 'italic' }}>s</span>
    </span>
  );
}

function useCountdown(targetIso) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(targetIso).getTime();
  let diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000); diff -= d * 86400000;
  const h = Math.floor(diff / 3600000); diff -= h * 3600000;
  const m = Math.floor(diff / 60000); diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  return { d, h, m, s };
}

function Cell({ big, label }) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 400, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{big}</span>
      <span style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
    </div>
  );
}

function Countdown() {
  const { d, h, m, s } = useCountdown('2026-08-15T15:30:00+02:00');
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, fontFamily: 'var(--serif)' }}>
      <Cell big={d} label="dni" />
      <span style={{ color: 'var(--rule-strong)', fontSize: 24 }}>·</span>
      <Cell big={pad(h)} label="godz" />
      <span style={{ color: 'var(--rule-strong)', fontSize: 24 }}>·</span>
      <Cell big={pad(m)} label="min" />
      <span style={{ color: 'var(--rule-strong)', fontSize: 24 }}>·</span>
      <Cell big={pad(s)} label="sek" />
    </div>
  );
}

function CountdownMoment() {
  return (
    <div style={{ marginTop: 64 }}>
      <div style={{ height: 1, background: 'var(--rule)', width: '100%' }} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 0',
        gap: 12,
      }}>
        <div className="smallcaps" style={{ color: 'var(--muted)' }}>widzimy się za:</div>
        <Countdown />
      </div>
      <div style={{ height: 1, background: 'var(--rule)', width: '100%' }} />
    </div>
  );
}

function Hero() {
  return (
    <section style={heroStyles.wrap}>
      <div style={{ position: 'relative' }}>
        <div className="bw" style={{
          width: '100%',
          height: 'clamp(380px, 52vw, 640px)',
          overflow: 'hidden',
        }}>
          <img src="img/wed1.jpg" alt="" loading="eager" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
        </div>
      </div>

      <div style={{ marginTop: 88, textAlign: 'center' }}>
        <div className="smallcaps" style={{ marginBottom: 24, color: 'var(--muted)' }}>
          ślub &amp; cocktail party
        </div>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(48px, 11vw, 168px)',
          fontWeight: 400,
          lineHeight: 0.88,
          letterSpacing: '-0.045em',
          margin: 0,
          textWrap: 'balance',
        }}>
          klara <span style={{ fontStyle: 'italic', fontWeight: 300 }}>&amp;</span> szymon
        </h1>
        <h2 style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(28px, 5vw, 64px)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          margin: '14px 0 0',
        }}>
          Koprowscy
        </h2>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          marginTop: 36,
          flexWrap: 'wrap',
        }}>
          <span style={{ width: 48, height: 1, background: 'var(--rule-strong)' }} />
          <span className="smallcaps" style={{ color: 'var(--ink)' }}>15 sierpnia 2026 · wrocław golf club</span>
          <span style={{ width: 48, height: 1, background: 'var(--rule-strong)' }} />
        </div>
      </div>

      <CountdownMoment />
    </section>
  );
}

Object.assign(window, { Hero, Monogram });
