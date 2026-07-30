/* Prezenty subpage */

function GiftRule({ num, label, headline, body }) {
  return (
    <article className="stack-mobile" style={{
      display: 'grid',
      gridTemplateColumns: '120px 1fr',
      gap: 48,
      padding: '56px 0',
      borderBottom: '1px solid var(--rule)',
      alignItems: 'start',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--serif)',
          fontSize: 56,
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          color: 'var(--ink)',
        }}>
          {num}
        </div>
        {label && (
          <div className="smallcaps" style={{ color: 'var(--muted)', marginTop: 10 }}>
            {label}
          </div>
        )}
      </div>

      <div>
        <h3 style={{
          fontFamily: 'var(--serif)',
          fontWeight: 400,
          fontSize: 'clamp(28px, 3.6vw, 44px)',
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          margin: 0,
        }}
          dangerouslySetInnerHTML={{ __html: headline }}
        />
        {body && (
          <div style={{
            fontFamily: 'var(--sans)',
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--ink)',
            marginTop: 18,
            maxWidth: 560,
            textWrap: 'pretty',
          }}
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}
      </div>
    </article>
  );
}

function PrezentyPage({ onBack }) {
  const tr = useT();
  const rules = tr('prezenty.rules');
  return (
    <main>
      {/* Cover */}
      <section style={{ padding: '80px var(--pad-x) 56px var(--pad-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, marginBottom: 32 }}>
          <div className="smallcaps" style={{ color: 'var(--ink)' }}>{tr('prezenty.kicker')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
            {tr('prezenty.annot')}
          </div>
        </div>

        <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'end', marginTop: 24 }}>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(44px, 6.5vw, 104px)',
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            margin: 0,
          }}
            dangerouslySetInnerHTML={{ __html: tr('prezenty.title') }}
          />
          <p style={{
            fontFamily: 'var(--sans)',
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--muted)',
            margin: 0,
            maxWidth: 380,
            textWrap: 'pretty',
          }}>
            {tr('prezenty.sub')}
          </p>
        </div>
      </section>

      {/* Rules */}
      <section style={{ padding: '0 var(--pad-x) 80px var(--pad-x)' }}>
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          {(Array.isArray(rules) ? rules : []).map((r, i) => (
            <GiftRule
              key={i}
              num={String(i + 1).padStart(2, '0')}
              label={r.label}
              headline={r.headline}
              body={r.body}
            />
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

Object.assign(window, { PrezentyPage });
