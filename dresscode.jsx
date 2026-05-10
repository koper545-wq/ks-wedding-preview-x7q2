/* Dress Code subpage */

function DressCodeRule({ num, label, headline, body, accent }) {
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'start' }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(28px, 3.6vw, 44px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: 0,
          }}>
            {headline}
          </h3>
          <div style={{
            fontFamily: 'var(--sans)',
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--ink)',
            marginTop: 18,
            maxWidth: 540,
            textWrap: 'pretty',
          }}>
            {body}
          </div>
        </div>
        {accent && (
          <div style={{ width: 120 }}>
            {accent}
          </div>
        )}
      </div>
    </article>
  );
}

function ColorSwatches({ swatches }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {swatches.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 28,
            height: 28,
            background: s.color,
            border: s.border ? '1px solid var(--rule-strong)' : '1px solid var(--rule)',
            display: 'inline-block',
          }} />
          <span style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            {s.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function FabricIcon() {
  return (
    <svg viewBox="0 0 120 80" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3 L6 3 M3 0 L3 6" stroke="rgba(46,46,46,0.35)" strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect x="2" y="2" width="116" height="76" fill="url(#weave)" stroke="var(--rule-strong)" strokeWidth="0.5" />
    </svg>
  );
}

function DressCodePage({ onBack }) {
  const tr = useT();
  return (
    <main>
      {/* Cover */}
      <section style={{ padding: '80px var(--pad-x) 56px var(--pad-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, marginBottom: 32 }}>
          <div className="smallcaps" style={{ color: 'var(--ink)' }}>{tr('dresscode.kicker')}</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
            {tr('dresscode.annot')}
          </div>
        </div>

        <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'end', marginTop: 24 }}>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(48px, 7.5vw, 120px)',
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            margin: 0,
          }}
            dangerouslySetInnerHTML={{ __html: tr('dresscode.title') }}
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
            {tr('dresscode.sub')}
          </p>
        </div>
      </section>

      {/* Rules */}
      <section style={{ padding: '0 var(--pad-x) 80px var(--pad-x)' }}>
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          <DressCodeRule
            num="01"
            label={tr('dresscode.rule1.label')}
            headline={<span dangerouslySetInnerHTML={{ __html: tr('dresscode.rule1.headline') }} />}
            body={<span dangerouslySetInnerHTML={{ __html: tr('dresscode.rule1.body') }} />}
          />
          <DressCodeRule
            num="02"
            label={tr('dresscode.rule2.label')}
            headline={<span dangerouslySetInnerHTML={{ __html: tr('dresscode.rule2.headline') }} />}
            body={<>
              {tr('dresscode.rule2.bodyParas').map((p, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : '14px 0 0' }}>{p}</p>
              ))}
            </>}
          />
          <DressCodeRule
            num="03"
            label={tr('dresscode.rule3.label')}
            headline={<span dangerouslySetInnerHTML={{ __html: tr('dresscode.rule3.headline') }} />}
            body={<span dangerouslySetInnerHTML={{ __html: tr('dresscode.rule3.body') }} />}
          />
        </div>
      </section>

      {/* Outro */}
      <section style={{
        padding: '80px var(--pad-x) 96px var(--pad-x)',
        borderTop: '1px solid var(--rule)',
        background: 'var(--ink)',
        color: 'var(--cream)',
      }}>
        <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div className="smallcaps" style={{ color: 'rgba(255,252,240,0.5)', marginBottom: 18 }}>{tr('dresscode.outroKicker')}</div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px, 3.2vw, 40px)', fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0, color: 'var(--cream)' }}
              dangerouslySetInnerHTML={{ __html: tr('dresscode.outro') }}
            />
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'rgba(255,252,240,0.85)', lineHeight: 1.7, textAlign: 'right' }}>
            {tr('dresscode.contact')}
          </div>
        </div>
      </section>

      {/* Pagination – back to landing */}
      <section style={{ padding: '40px var(--pad-x) 32px var(--pad-x)', borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            display: 'inline-flex', alignItems: 'center', gap: 14,
            color: 'var(--ink)',
          }}>
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18 }}>←</span>
            <span className="smallcaps" style={{ borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>{tr('dresscode.back')}</span>
          </button>
          <div className="smallcaps" style={{ color: 'var(--muted)' }}>{tr('dresscode.pageMeta')}</div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

Object.assign(window, { DressCodePage });
