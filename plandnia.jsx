/* Plan Dnia subpage */

function PlanDniaPage({ onBack }) {
  const tr = useT();
  return (
    <main>
      <section style={{ padding: '120px var(--pad-x) 80px var(--pad-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, marginBottom: 80 }}>
          <div className="smallcaps" style={{ color: 'var(--ink)' }}>{tr('plandnia.kicker')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
            {tr('plandnia.annot')}
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
            dangerouslySetInnerHTML={{ __html: tr('plandnia.title') }}
          />
        </div>
      </section>

      <section style={{
        padding: '96px var(--pad-x) 96px var(--pad-x)',
        borderTop: '1px solid var(--rule)',
        background: 'var(--ink)',
        color: 'var(--cream)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="smallcaps" style={{ color: 'rgba(255,252,240,0.5)', marginBottom: 28 }}>
            {tr('plandnia.darkKicker')}
          </div>

          <h2 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: 0,
            color: 'var(--cream)',
          }}
            dangerouslySetInnerHTML={{ __html: tr('plandnia.darkTitle') }}
          />

          <p style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 22,
            color: 'rgba(255,252,240,0.78)',
            marginTop: 40,
          }}
            dangerouslySetInnerHTML={{ __html: tr('plandnia.darkSub') }}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

Object.assign(window, { PlanDniaPage });
