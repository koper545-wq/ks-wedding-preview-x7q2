/* Sections – 00 Informacje, Intro/Soon, Format Wesela */

/* ── 00 Informacje ──────────────────────────────────────────────────────── */

function SectionInformacje() {
  const tr = useT();
  const facts = tr('informacje.facts');
  const points = tr('informacje.mapPoints');
  return (
    <section style={{
      padding: '120px var(--pad-x) 120px var(--pad-x)',
      borderTop: '1px solid var(--rule)',
    }}>
      <div style={{ marginBottom: 56 }}>
        <div className="smallcaps" style={{ color: 'var(--ink)' }}>{tr('informacje.kicker')}</div>
      </div>

      <div className="stack-mobile" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1px 1fr',
        gap: 64,
        marginRight: 64,
      }}>
        {/* LEFT – facts */}
        <div>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(36px, 5vw, 72px)',
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            margin: '0 0 56px',
          }}
            dangerouslySetInnerHTML={{ __html: tr('informacje.title') }}
          />

          <FactRow label={facts.date[0]}       value={facts.date[1]}       sub={facts.date[2]} />
          <FactRow label={facts.start[0]}      value={facts.start[1]}      sub={facts.start[2]} />
          <FactRow label={facts.ceremony[0]}   value={facts.ceremony[1]}   sub={facts.ceremony[2]} />
          <FactRow label={facts.end[0]}        value={facts.end[1]}        sub={facts.end[2]} />
          <FactRow label={facts.venue[0]}      value={facts.venue[1]}      sub={facts.venue[2]} />
          <FactRow label={facts.directions[0]} value={facts.directions[1]} sub={facts.directions[2]} last />
        </div>

        <div className="rule-v" />

        {/* RIGHT – map */}
        <div>
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1965 / 1802',
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            overflow: 'hidden',
          }}>
            <MapPlaceholder />
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              fontFamily: 'var(--sans)',
              fontSize: 13,
              lineHeight: 1.7,
              color: 'var(--ink)',
              maxWidth: '70%',
            }}>
              <li style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--muted)' }}>·</span>
                <span>{points[0]}</span>
              </li>
              <li style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--muted)' }}>·</span>
                <span>{points[1]}</span>
              </li>
              <li style={{ display: 'flex', gap: 10, color: 'var(--muted)', fontStyle: 'italic', fontFamily: 'var(--serif)', fontSize: 14 }}>
                <span>·</span>
                <span>{points[2]}</span>
              </li>
            </ul>
            <a href="https://maps.google.com/?q=Wrocław+Golf+Club+Kryniczno"
               target="_blank" rel="noreferrer"
               className="smallcaps"
               style={{
                 color: 'var(--ink)',
                 textDecoration: 'none',
                 borderBottom: '1px solid var(--ink)',
                 paddingBottom: 2,
                 whiteSpace: 'nowrap',
               }}>
              {tr('informacje.mapsLink')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FactRow({ label, value, sub, last }) {
  return (
    <div className="stack-mobile" style={{
      display: 'grid',
      gridTemplateColumns: '120px 1fr',
      gap: 24,
      padding: '20px 0',
      borderBottom: last ? 'none' : '1px solid var(--rule)',
      alignItems: 'baseline',
    }}>
      <div className="smallcaps" style={{ color: 'var(--muted)' }}>{label}</div>
      <div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.2, letterSpacing: '-0.01em', fontWeight: 400 }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

function MapPlaceholder() {
  // Illustrated map image (img/map.jpg).
  return (
    <img
      src="img/map.jpg"
      alt="mapa — wrocław golf club, kryniczno"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        display: 'block',
      }}
    />
  );
}

/* ── Soon / Intro ───────────────────────────────────────────────────────── */

function SectionSoon() {
  const tr = useT();
  return (
    <section style={{
      padding: '88px var(--pad-x) 120px var(--pad-x)',
      borderTop: '1px solid var(--rule)',
      position: 'relative',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 80, marginBottom: 24 }}>
        <div className="smallcaps" style={{ color: 'var(--ink)' }}>{tr('soon.kicker')}</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
          {tr('soon.annot')}
        </div>
      </div>

      <div className="stack-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, marginRight: 64, alignItems: 'start' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(34px, 5vw, 76px)',
            lineHeight: 0.96,
            letterSpacing: '-0.035em',
            margin: 0,
          }}
            dangerouslySetInnerHTML={{ __html: tr('soon.title') }}
          />
        </div>

        <div style={{ paddingTop: 16, maxWidth: 460 }}>
          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: 22,
            lineHeight: 1.45,
            letterSpacing: '-0.005em',
            color: 'var(--ink)',
            margin: 0,
            textWrap: 'pretty',
          }}>
            {tr('soon.body1')}
          </p>
          <p style={{
            fontFamily: 'var(--sans)',
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--muted)',
            marginTop: 28,
            maxWidth: 420,
            textWrap: 'pretty',
          }}>
            {tr('soon.body2')}
          </p>

          <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 32, height: 1, background: 'var(--ink)' }} />
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink)' }}>
              {tr('soon.sign')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Format wesela – 01 / 02 / 03 ───────────────────────────────────────── */

function SectionFormat({ onDressCode }) {
  const tr = useT();
  const cols = tr('format.cols');
  return (
    <section style={{
      padding: '120px var(--pad-x) 140px var(--pad-x)',
      borderTop: '1px solid var(--rule)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 80, marginBottom: 80 }}>
        <div className="smallcaps" style={{ color: 'var(--ink)' }}>{tr('format.kicker')}</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
          {tr('format.annot')}
        </div>
      </div>

      <h2 style={{
        fontFamily: 'var(--serif)',
        fontWeight: 400,
        fontSize: 'clamp(40px, 6vw, 88px)',
        lineHeight: 0.95,
        letterSpacing: '-0.035em',
        margin: '0 0 80px',
        maxWidth: '14ch',
      }}
        dangerouslySetInnerHTML={{ __html: tr('format.title') }}
      />

      <div className="stack-mobile" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
        gap: 56,
        marginRight: 64,
      }}>
        <FormatColumn number="01" name={cols.food.name}    tagline={cols.food.tagline}    body={cols.food.body} />
        <div className="rule-v" />
        <FormatColumn number="02" name={cols.outdoor.name} tagline={cols.outdoor.tagline} body={cols.outdoor.body} />
        <div className="rule-v" />
        <FormatColumn number="03" name={cols.late.name}    tagline={cols.late.tagline}    body={cols.late.body} />
      </div>

      <div style={{ marginTop: 96, borderTop: '1px solid var(--rule)', paddingTop: 32, marginRight: 64, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--muted)' }}>
          {tr('format.outro')}
        </div>
      </div>
    </section>
  );
}

function FormatColumn({ number, name, tagline, time, body }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36 }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 56, fontWeight: 300, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--ink)' }}>
          {number}
        </span>
        {time && <span className="smallcaps" style={{ color: 'var(--muted)' }}>{time}</span>}
      </div>

      <h3 style={{
        fontFamily: 'var(--serif)',
        fontWeight: 400,
        fontSize: 36,
        lineHeight: 1,
        letterSpacing: '-0.025em',
        margin: '0 0 8px',
      }}
        dangerouslySetInnerHTML={{ __html: name }}
      />
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', marginBottom: 28 }}>
        – {tagline}
      </div>

      <p style={{
        fontFamily: 'var(--sans)',
        fontSize: 14,
        lineHeight: 1.65,
        color: 'var(--ink)',
        margin: 0,
        textWrap: 'pretty',
      }}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </div>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────── */

function SiteFooter() {
  const tr = useT();
  return (
    <footer style={{
      padding: '64px var(--pad-x) 56px var(--pad-x)',
      borderTop: '1px solid var(--rule)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 48 }}>
        <Monogram size={32} />
        <div style={{ textAlign: 'right' }}>
          <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: 6 }}>{tr('footer.contact')}</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)' }}>{tr('footer.contactValue')}</div>
        </div>
      </div>
      <div className="rule-h" style={{ marginTop: 40, marginBottom: 24 }} />
      <div className="footer-meta" style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', gap: 16, flexWrap: 'wrap' }}>
        <span>{tr('footer.copyright')}</span>
        <span>{tr('footer.madeBy')} <em style={{ fontFamily: 'var(--serif)', textTransform: 'none', letterSpacing: 0, fontSize: 13 }}>wedded</em></span>
      </div>
    </footer>
  );
}

Object.assign(window, { SectionInformacje, SectionSoon, SectionFormat, SiteFooter });
