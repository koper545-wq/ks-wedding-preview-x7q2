/* App — top sticky masthead + state-based routing */

function TopNav({ active, onJump, route, goto }) {
  const items = [
    { id: 'informacje', label: 'informacje',  num: '00', kind: 'scroll' },
    { id: 'soon',       label: 'list',        num: '01', kind: 'scroll' },
    { id: 'format',     label: 'format',      num: '02', kind: 'scroll' },
    { id: 'dresscode',  label: 'dress code',  num: '02', kind: 'route' },
    { id: 'plandnia',   label: 'plan dnia',   num: '03', kind: 'route' },
    { id: 'rsvp',       label: 'rsvp',        num: '04', kind: 'route' },
  ];
  const handleClick = (it) => {
    if (it.kind === 'route') { goto(it.id); return; }
    if (route !== 'home') { goto('home'); setTimeout(() => onJump(it.id), 50); return; }
    onJump(it.id);
  };
  return (
    <nav aria-label="contents" style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'var(--cream)',
      borderBottom: '1px solid var(--rule)',
      backdropFilter: 'saturate(140%) blur(6px)',
      WebkitBackdropFilter: 'saturate(140%) blur(6px)',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'center',
      gap: 32,
      padding: '14px 56px',
    }}>
      <button onClick={() => goto('home')}
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
        <Monogram size={22} />
      </button>

      <div style={{
        display: 'flex',
        gap: 36,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {items.map((it) => {
          const isActive = (it.kind === 'route' ? route === it.id : (route === 'home' && active === it.id));
          return (
            <button key={it.id}
              onClick={() => handleClick(it)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 0',
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 8,
                color: isActive ? 'var(--ink)' : 'var(--muted)',
                borderBottom: isActive ? '1px solid var(--ink)' : '1px solid transparent',
                fontFamily: 'var(--sans)',
                fontSize: 10,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontWeight: isActive ? 600 : 400,
              }}>
              <span style={{ fontFamily: 'var(--mono)', letterSpacing: '0.04em', fontSize: 9, opacity: 0.7 }}>{it.num}</span>
              <span>{it.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: 9,
        letterSpacing: '0.18em',
        color: 'var(--muted)',
        textTransform: 'uppercase',
      }}>
        15 · viii · mmxxvi
      </div>
    </nav>
  );
}

function RSVPTeaser({ onOpen }) {
  return (
    <section id="rsvp-anchor" style={{
      padding: '120px 56px 140px 56px',
      borderTop: '1px solid var(--rule)',
      background: 'var(--ink)',
      color: 'var(--cream)',
      position: 'relative',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 80, marginBottom: 64 }}>
        <div className="smallcaps" style={{ color: 'rgba(255,252,240,0.5)' }}>0³ — rsvp</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'rgba(255,252,240,0.5)', textAlign: 'right' }}>
          please reply · §03
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: 80,
        marginRight: 64,
        alignItems: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--serif)',
          fontWeight: 400,
          fontSize: 'clamp(48px, 8vw, 128px)',
          lineHeight: 0.92,
          letterSpacing: '-0.04em',
          margin: 0,
          color: 'var(--cream)',
        }}>
          dajcie znać<br/>
          <span style={{ fontStyle: 'italic', fontWeight: 300 }}>czy</span> będziecie.
        </h2>

        <div>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.65, color: 'rgba(255,252,240,0.78)', maxWidth: 360, margin: 0 }}>
            formularz rsvp z preferencjami żywieniowymi i adresem mailowym, na który będziemy wysyłać aktualizacje. trzy kroki, dwie minuty.
          </p>
          <div style={{ marginTop: 40 }}>
            <button onClick={onOpen} style={{
              background: 'var(--cream)', color: 'var(--ink)', border: 'none',
              padding: '18px 28px', cursor: 'pointer',
              fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.22em',
              textTransform: 'uppercase', fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 12,
            }}>
              wypełnij rsvp
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16 }}>→</span>
            </button>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'rgba(255,252,240,0.55)', marginTop: 14 }}>
              dwie minuty, siedem pytań
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [active, setActive] = React.useState('cover');
  const [route, setRoute] = React.useState(() => (window.location.hash.replace('#','') || 'home'));

  React.useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash.replace('#','') || 'home');
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goto = (r) => {
    if (r === 'home') window.location.hash = '';
    else window.location.hash = r;
  };

  React.useEffect(() => {
    const ids = ['cover', 'informacje', 'soon', 'format'];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.2, 0.5] });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [route]);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <TopNav active={active} onJump={jump} route={route} goto={goto} />

      {route === 'dresscode' ? (
        <DressCodePage onBack={() => goto('home')} />
      ) : route === 'plandnia' ? (
        <PlanDniaPage onBack={() => goto('home')} />
      ) : route === 'rsvp' ? (
        <RSVPPage onBack={() => goto('home')} variant="steps" />
      ) : (
        <main>
          <div id="cover"><Hero /></div>
          <div id="informacje"><SectionInformacje /></div>
          <div id="soon"><SectionSoon /></div>
          <div id="format"><SectionFormat onDressCode={() => goto('dresscode')} /></div>
          <RSVPTeaser onOpen={() => goto('rsvp')} />
          <SiteFooter />
        </main>
      )}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
