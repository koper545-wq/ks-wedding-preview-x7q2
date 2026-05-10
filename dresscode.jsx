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
  return (
    <main>
      {/* Cover */}
      <section style={{ padding: '80px var(--pad-x) 56px var(--pad-x)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, marginBottom: 32 }}>
          <div className="smallcaps" style={{ color: 'var(--ink)' }}>04 – dress code</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
            what to wear · §04
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
          }}>
            ubierzcie się <span style={{ fontStyle: 'italic', fontWeight: 300 }}>elegancko</span>,<br/>
            jak na letnie <span style={{ fontStyle: 'italic', fontWeight: 300 }}>cocktail</span> party.
          </h1>
          <p style={{
            fontFamily: 'var(--sans)',
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--muted)',
            margin: 0,
            maxWidth: 380,
            textWrap: 'pretty',
          }}>
            outdoor po południu, indoor wieczorem.
          </p>
        </div>
      </section>

      {/* Rules */}
      <section style={{ padding: '0 var(--pad-x) 80px var(--pad-x)' }}>
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          <DressCodeRule
            num="01"
            label="tkaniny"
            headline={<>lekkie <span style={{ fontStyle: 'italic', fontWeight: 300 }}>i</span> zwiewne.</>}
            body={<>
              polecamy oddychające materiały. unikajcie ciężkich syntetyków, satyny do podłogi, sztywnych konstrukcji. to będzie letnie wesele! 🍓
            </>}
            accent={<FabricIcon />}
          />
          <DressCodeRule
            num="02"
            label="kolory sukienek"
            headline={<>girls, <span style={{ fontStyle: 'italic', fontWeight: 300 }}>nie</span> mamy bardzo sztywnych zasad, ale…</>}
            body={<>
              <p style={{ margin: 0 }}>
                unikajcie bardzo mocnych kolorów, takich jak np. krwista czerwień czy neony.
              </p>
              <p style={{ margin: '14px 0 0' }}>
                czerń jest ok, ale stawiajcie na kolory – to jest letnie wesele! naturalnie biel, ecru, kość słoniowa zarezerwowane są dla panny młodej.
              </p>
              <p style={{ margin: '14px 0 0' }}>
                wzory czy kwieciste kreacje są jak najbardziej okej.
              </p>
            </>}
            accent={<ColorSwatches swatches={[
              { name: 'sage', color: '#9DA98F' },
              { name: 'navy', color: '#2B3A55' },
              { name: 'dusty rose', color: '#C99B92' },
              { name: 'terracotta', color: '#B36A4A' },
              { name: 'olive', color: '#7C7B4E' },
            ]} />}
          />
          <DressCodeRule
            num="03"
            label="dla panów"
            headline={<>guys, <span style={{ fontStyle: 'italic', fontWeight: 300 }}>nie</span> akceptujemy t-shirtów – koszule only!</>}
            body={<>
              stawiajcie na elegancki look. uprzedzając pytania – lniany garnitur też jest ok.
            </>}
            accent={<ColorSwatches swatches={[
              { name: 'navy', color: '#2B3A55' },
              { name: 'beige', color: '#C7B59A' },
              { name: 'lt. grey', color: '#B5B2AA' },
              { name: 'olive', color: '#7C7B4E' },
            ]} />}
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
            <div className="smallcaps" style={{ color: 'rgba(255,252,240,0.5)', marginBottom: 18 }}>jeśli macie wątpliwości</div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px, 3.2vw, 40px)', fontWeight: 400, lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0, color: 'var(--cream)' }}>
              piszcie, <span style={{ fontStyle: 'italic', fontWeight: 300 }}>postaramy się</span> doradzić i odpowiedzieć na wszystkie Wasze pytania!
            </p>
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 15, color: 'rgba(255,252,240,0.85)', lineHeight: 1.7, textAlign: 'right' }}>
            kontakt@klaraiszymon.pl
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
            <span className="smallcaps" style={{ borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>powrót na cover</span>
          </button>
          <div className="smallcaps" style={{ color: 'var(--muted)' }}>§04 · dress code · k&amp;s mmxxvi</div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

Object.assign(window, { DressCodePage });
