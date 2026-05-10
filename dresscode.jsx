/* Dress Code subpage — editorial column with 5 numbered blocks */

function DressCodeRule({ num, label, headline, body, accent }) {
  return (
    <article style={{
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
        <div className="smallcaps" style={{ color: 'var(--muted)', marginTop: 10 }}>
          {label}
        </div>
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
          <p style={{
            fontFamily: 'var(--sans)',
            fontSize: 15,
            lineHeight: 1.65,
            color: 'var(--ink)',
            marginTop: 18,
            maxWidth: 540,
            textWrap: 'pretty',
          }}>
            {body}
          </p>
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
      <text x="60" y="46" textAnchor="middle" fontFamily="Inter" fontSize="8" letterSpacing="2" fill="var(--muted)">FIG. 02</text>
    </svg>
  );
}

function ShoeIcon() {
  return (
    <svg viewBox="0 0 120 80" style={{ width: '100%', height: 'auto' }}>
      <g fill="none" stroke="var(--ink)" strokeWidth="0.8">
        {/* simple block heel */}
        <path d="M14 56 Q14 38 36 36 L82 32 Q104 30 104 46 L104 60 L96 60 L96 50 L18 50 Z" />
        <line x1="14" y1="56" x2="104" y2="60" strokeWidth="0.5" />
      </g>
      <text x="60" y="74" textAnchor="middle" fontFamily="Inter" fontSize="8" letterSpacing="2" fill="var(--muted)">FIG. 03 — block heel</text>
    </svg>
  );
}

function DressCodePage({ onBack }) {
  return (
    <main>
      {/* Cover */}
      <section style={{ padding: '80px 56px 56px 56px' }}>
        <header style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          marginBottom: 18,
        }}>
          <div className="smallcaps" style={{ color: 'var(--muted)' }}>vol. 01 — wrocław</div>
          <div className="smallcaps" style={{ color: 'var(--muted)' }}>k &amp; s · cocktail · ślub</div>
          <div className="smallcaps" style={{ color: 'var(--muted)', textAlign: 'right' }}>summer mmxxvi</div>
        </header>
        <div className="rule-h" />

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, marginTop: 40, marginBottom: 32 }}>
          <div className="smallcaps" style={{ color: 'var(--ink)' }}>0² — dress code</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
            what to wear · §02
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'end', marginTop: 24 }}>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(56px, 9vw, 144px)',
            lineHeight: 0.92,
            letterSpacing: '-0.04em',
            margin: 0,
          }}>
            ubierzcie się <span style={{ fontStyle: 'italic', fontWeight: 300 }}>jak</span> na<br/>
            letnie <span style={{ fontStyle: 'italic', fontWeight: 300 }}>cocktail</span> party.
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
            outdoor po południu, indoor wieczorem. lekko, oddychająco, elegancko — ale bez krawatów do kolan i czerni grobowej. poniżej pięć krótkich notatek.
          </p>
        </div>
      </section>

      {/* Rules */}
      <section style={{ padding: '0 56px 80px 56px' }}>
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          <DressCodeRule
            num="01"
            label="tkaniny"
            headline={<>len, <span style={{ fontStyle: 'italic', fontWeight: 300 }}>jedwab</span>, lekka wełna, bawełna.</>}
            body="lato + outdoor = oddychające. unikajcie ciężkich syntetyków, satyny do podłogi, sztywnych konstrukcji. naturalne tkaniny zachowają was świeżymi do północy."
            accent={<FabricIcon />}
          />
          <DressCodeRule
            num="02"
            label="kolory dla pań"
            headline={<>pastele, <span style={{ fontStyle: 'italic', fontWeight: 300 }}>zieleń</span>, granat, ziemiste tony.</>}
            body="przybrudzone róże, oliwka, pudry, terakota, granaty, grafity. wszystko co dobrze leży na trawie i w popołudniowym świetle. unikać neonów, czarnej długiej sukni i, naturalnie, bieli."
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
            label="kolory dla panów"
            headline={<>granat, <span style={{ fontStyle: 'italic', fontWeight: 300 }}>beż</span>, jasny szary, oliwka.</>}
            body="garnitur lekki, najlepiej letni. bez czerni grobowej. krawat opcjonalny — równie chętnie widzimy odkryte kołnierzyki, jedwabne chusty albo nic. brązowe buty mile widziane."
            accent={<ColorSwatches swatches={[
              { name: 'navy', color: '#2B3A55' },
              { name: 'beige', color: '#C7B59A' },
              { name: 'lt. grey', color: '#B5B2AA' },
              { name: 'olive', color: '#7C7B4E' },
            ]} />}
          />
          <DressCodeRule
            num="04"
            label="kolory zabronione"
            headline={<><span style={{ fontStyle: 'italic', fontWeight: 300 }}>biel</span>, ecru, kość słoniowa.</>}
            body="zarezerwowane dla panny młodej. dotyczy sukienek, garniturów, koszul w roli głównej, długich białych spódnic. biały szczegół (szal, koszula pod marynarką, biała koszula męska) — w porządku."
            accent={<ColorSwatches swatches={[
              { name: 'white', color: '#FFFFFF', border: true },
              { name: 'ecru', color: '#F2EAD3', border: true },
              { name: 'ivory', color: '#F8F4E3', border: true },
            ]} />}
          />
          <DressCodeRule
            num="05"
            label="buty"
            headline={<>outdoor + trawa = <span style={{ fontStyle: 'italic', fontWeight: 300 }}>nie</span> szpilki-iglice.</>}
            body="ceremonia i pierwsza część na trawie. sugerujemy koturny, blokowe obcasy, eleganckie sandały, espadryle z paskiem. po 22:00 przenosimy się do środka — wtedy wszystko gra."
            accent={<ShoeIcon />}
          />
        </div>
      </section>

      {/* Outro */}
      <section style={{
        padding: '80px 56px 96px 56px',
        borderTop: '1px solid var(--rule)',
        background: 'var(--ink)',
        color: 'var(--cream)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div className="smallcaps" style={{ color: 'rgba(255,252,240,0.5)', marginBottom: 18 }}>jeśli macie wątpliwości</div>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px, 3.2vw, 40px)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0, color: 'var(--cream)' }}>
              napiszcie. <span style={{ fontStyle: 'italic', fontWeight: 300 }}>chętniej</span> doradzimy niż patrzymy na wątpliwy outfit.
            </p>
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'rgba(255,252,240,0.7)', lineHeight: 1.7, textAlign: 'right' }}>
            klara@wedded.studio
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'rgba(255,252,240,0.45)', marginTop: 6 }}>
              odpowiadamy w 24h
            </div>
          </div>
        </div>
      </section>

      {/* Pagination — back to landing */}
      <section style={{ padding: '40px 56px 64px 56px', borderTop: '1px solid var(--rule)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            display: 'inline-flex', alignItems: 'center', gap: 14,
            color: 'var(--ink)',
          }}>
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18 }}>←</span>
            <span className="smallcaps" style={{ borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>powrót na cover</span>
          </button>
          <div className="smallcaps" style={{ color: 'var(--muted)' }}>§02 · dress code · k&amp;s mmxxvi</div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { DressCodePage });
