/* App – top sticky masthead + state-based routing */

function TopNav({ active, onJump, route, goto }) {
  const tr = useT();
  const { lang, setLang } = useLang();
  const items = [
    { id: 'soon',       labelKey: 'nav.list',       num: '01', kind: 'scroll' },
    { id: 'informacje', labelKey: 'nav.informacje', num: '02', kind: 'scroll' },
    { id: 'rsvp',       labelKey: 'nav.rsvp',       num: '03', kind: 'route' },
    { id: 'dresscode',  labelKey: 'nav.dresscode',  num: '04', kind: 'route' },
    { id: 'plandnia',   labelKey: 'nav.plandnia',   num: '05', kind: 'route' },
  ];
  const [menuOpen, setMenuOpen] = React.useState(false);

  const toggleLang = () => setLang(lang === 'pl' ? 'en' : 'pl');

  const handleClick = (it) => {
    setMenuOpen(false);
    if (it.kind === 'route') { goto(it.id); return; }
    if (route !== 'home') { goto('home'); setTimeout(() => onJump(it.id), 50); return; }
    onJump(it.id);
  };

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpen]);

  // Esc closes menu
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
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
        gap: 16,
        padding: '14px var(--pad-x)',
      }}>
        <button onClick={() => goto('home')}
          aria-label={tr('nav.home')}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
          <Monogram size={22} />
        </button>

        <div className="nav-desktop-items" style={{
          display: 'flex',
          gap: 36,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          {items.map((it) => {
            const isActive = (it.kind === 'route' ? route === it.id : (route === 'home' && active === it.id));
            return (
              <button key={it.id}
                onClick={() => handleClick(it)}
                aria-current={isActive ? 'page' : undefined}
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
                <span>{tr(it.labelKey)}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            className="lang-toggle"
            onClick={toggleLang}
            aria-label={`Switch to ${lang === 'pl' ? 'English' : 'Polski'}`}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--ink)',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
            <span style={{ fontWeight: lang === 'pl' ? 700 : 400, opacity: lang === 'pl' ? 1 : 0.4 }}>pl</span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ fontWeight: lang === 'en' ? 700 : 400, opacity: lang === 'en' ? 1 : 0.4 }}>en</span>
          </button>

          <button
            className="nav-hamburger"
            aria-label={menuOpen ? tr('nav.close') : tr('nav.open')}
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          id="nav-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="menu"
          style={{
            position: 'fixed',
            inset: 0,
            top: 67,
            zIndex: 50,
            background: 'var(--cream)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px var(--pad-x) 40px',
            animation: 'rsvp-fade-in 220ms cubic-bezier(.2,.8,.2,1) both',
          }}
        >
          <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: 16 }}>{tr('nav.menu')}</div>
          {items.map((it) => {
            const isActive = (it.kind === 'route' ? route === it.id : (route === 'home' && active === it.id));
            return (
              <button key={it.id}
                onClick={() => handleClick(it)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--rule)',
                  padding: '20px 0',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 18,
                  color: 'var(--ink)',
                  fontFamily: 'var(--serif)',
                  fontWeight: isActive ? 500 : 400,
                  fontSize: 28,
                }}>
                <span style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  opacity: 0.55,
                  minWidth: 28,
                }}>{it.num}</span>
                <span style={{ fontStyle: isActive ? 'italic' : 'normal', fontWeight: isActive ? 400 : 300 }}>{tr(it.labelKey)}</span>
                {isActive && <span style={{ marginLeft: 'auto', fontSize: 16, color: 'var(--muted)' }}>·</span>}
              </button>
            );
          })}
          <div style={{ marginTop: 'auto', paddingTop: 32, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="smallcaps">15 · viii · mmxxvi · wrocław</span>
            <button onClick={toggleLang} style={{
              background: 'transparent',
              border: '1px solid var(--rule-strong)',
              padding: '8px 14px',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.18em',
              color: 'var(--ink)',
              textTransform: 'uppercase',
            }}>
              <span style={{ fontWeight: lang === 'pl' ? 700 : 400, opacity: lang === 'pl' ? 1 : 0.4 }}>pl</span>
              <span style={{ opacity: 0.4, margin: '0 4px' }}>/</span>
              <span style={{ fontWeight: lang === 'en' ? 700 : 400, opacity: lang === 'en' ? 1 : 0.4 }}>en</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function RSVPTeaser({ onOpen }) {
  const tr = useT();
  return (
    <section id="rsvp-anchor" style={{
      padding: '120px var(--pad-x) 140px var(--pad-x)',
      borderTop: '1px solid var(--rule)',
      background: 'var(--ink)',
      color: 'var(--cream)',
      position: 'relative',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 80, marginBottom: 64 }}>
        <div className="smallcaps" style={{ color: 'rgba(255,252,240,0.5)' }}>{tr('rsvpTeaser.kicker')}</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'rgba(255,252,240,0.5)', textAlign: 'right' }}>
          {tr('rsvpTeaser.annot')}
        </div>
      </div>

      <div className="stack-mobile" style={{
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
        }}
          dangerouslySetInnerHTML={{ __html: tr('rsvpTeaser.title') }}
        />

        <div>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 15, lineHeight: 1.65, color: 'rgba(255,252,240,0.78)', maxWidth: 360, margin: 0 }}>
            {tr('rsvpTeaser.body')}
          </p>
          <div style={{ marginTop: 40 }}>
            <button onClick={onOpen} style={{
              background: 'var(--cream)', color: 'var(--ink)', border: 'none',
              padding: '18px 28px', cursor: 'pointer',
              fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.22em',
              textTransform: 'uppercase', fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 12,
            }}>
              {tr('rsvpTeaser.cta')}
              <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16 }}>→</span>
            </button>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'rgba(255,252,240,0.55)', marginTop: 14 }}>
              {tr('rsvpTeaser.ctaSub')}
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
  const [lang, setLangState] = React.useState(() => getInitialLang());

  const setLang = React.useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('ks2026_lang', l); } catch {}
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

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
      if (visible[0]) {
        const id = visible[0].target.id;
        setActive(id === 'format' ? 'informacje' : id);
      }
    }, { rootMargin: '-30% 0px -50% 0px', threshold: [0, 0.2, 0.5] });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [route]);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
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
          <div id="soon"><SectionSoon /></div>
          <div id="informacje"><SectionInformacje /></div>
          <div id="format"><SectionFormat onDressCode={() => goto('dresscode')} /></div>
          <RSVPTeaser onOpen={() => goto('rsvp')} />
          <SiteFooter />
        </main>
      )}
    </LangContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
