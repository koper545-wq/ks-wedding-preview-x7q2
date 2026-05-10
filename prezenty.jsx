/* Prezenty subpage – placeholder until details are confirmed */

function PrezentyPage({ onBack }) {
  const tr = useT();
  return (
    <main>
      <section style={{ padding: '120px var(--pad-x) 80px var(--pad-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, marginBottom: 80 }}>
          <div className="smallcaps" style={{ color: 'var(--ink)' }}>{tr('prezenty.kicker')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
            {tr('prezenty.annot')}
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(64px, 10vw, 160px)',
            lineHeight: 0.92,
            letterSpacing: '-0.04em',
            margin: 0,
          }}
            dangerouslySetInnerHTML={{ __html: tr('prezenty.title') }}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

Object.assign(window, { PrezentyPage });
