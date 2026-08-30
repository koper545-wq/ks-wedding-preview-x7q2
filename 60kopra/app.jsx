/* Nawigacja + złożenie strony (jedna strona, kotwice) */

const NAV_ITEMS = [
  { id: 'informacje', num: '01' },
  { id: 'transport',  num: '02' },
  { id: 'dresscode',  num: '03' },
  { id: 'kwiaty',     num: '04' },
  { id: 'rsvp',       num: '05' },
];

function scrollToId(id, behavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior, block: 'start' });
  history.replaceState(null, '', '#' + id);
}

function TopNav() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const go = (id) => { setMenuOpen(false); scrollToId(id); };

  return (
    <>
      <nav aria-label="spis treści" style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--rule)',
        padding: '14px var(--pad-x)',
      }}>
        <div style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="smallcaps" style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--fg)',
            whiteSpace: 'nowrap',
          }}>
            {COPY.footer.brand}
          </button>

          <div className="nav-desktop-items" style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
            {NAV_ITEMS.map((it) => (
              <button key={it.id} onClick={() => go(it.id)} className="smallcaps" style={{
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--fg)',
                whiteSpace: 'nowrap',
              }}>
                {COPY.nav[it.id]}
              </button>
            ))}
          </div>

          <div className="nav-desktop-date smallcaps" style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
            {EVENT.dateLabel}
          </div>

          <button
            className="nav-hamburger"
            aria-label={menuOpen ? COPY.nav.close : COPY.nav.open}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'var(--bg)',
          padding: '24px var(--pad-x)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="smallcaps">{COPY.nav.menu}</span>
            <button onClick={() => setMenuOpen(false)} className="smallcaps" style={{
              background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg)', padding: 0,
            }}>{COPY.nav.close}</button>
          </div>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column' }}>
            {NAV_ITEMS.map((it) => (
              <button key={it.id} onClick={() => go(it.id)} style={{
                background: 'transparent',
                border: 'none',
                borderTop: '1px solid var(--rule)',
                padding: '22px 0',
                cursor: 'pointer',
                color: 'var(--fg)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 18,
                textAlign: 'left',
              }}>
                <span className="smallcaps" style={{ color: 'var(--muted)' }}>{it.num}</span>
                <span style={{ fontFamily: 'var(--display)', fontSize: 'clamp(28px, 8vw, 40px)', lineHeight: 1, textTransform: 'uppercase' }}>{COPY.nav[it.id]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  React.useEffect(() => {
    document.title = COPY.meta.title;

    // Wejście z linkiem #sekcja. 'instant' omija globalne scroll-behavior: smooth
    // (animowany skok był przerywany przez przywracanie scrolla przez przeglądarkę),
    // a powtórka po `load` łapie przesunięcie layoutu po doczytaniu fontów.
    const hash = window.location.hash.replace('#', '');
    if (!hash || !document.getElementById(hash)) return;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const jump = () => scrollToId(hash, 'instant');
    jump();
    if (document.readyState === 'complete') return;
    window.addEventListener('load', jump, { once: true });
    return () => window.removeEventListener('load', jump);
  }, []);

  return (
    <>
      <TopNav />
      <Hero onRsvp={() => scrollToId('rsvp')} />
      <main>
        <SectionInformacje />
        <SectionTransport />
        <SectionDressCode />
        <SectionKwiaty />
        <RSVPSection />
      </main>
      <SiteFooter />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
