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

      <section style={{ padding: '40px var(--pad-x) 64px var(--pad-x)', borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            display: 'inline-flex', alignItems: 'center', gap: 14,
            color: 'var(--ink)',
          }}>
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18 }}>←</span>
            <span className="smallcaps" style={{ borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>{tr('prezenty.back')}</span>
          </button>
          <div className="smallcaps" style={{ color: 'var(--muted)' }}>{tr('prezenty.pageMeta')}</div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

Object.assign(window, { PrezentyPage });
