/* Sections — 00 Informacje, Intro/Soon, Format Wesela */

/* ── 00 Informacje ──────────────────────────────────────────────────────── */

function SectionInformacje() {
  return (
    <section style={{
      padding: '120px 56px 120px 56px',
      borderTop: '1px solid var(--rule)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 80, marginBottom: 56 }}>
        <div className="smallcaps" style={{ color: 'var(--ink)' }}>00 — informacje ogólne</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
          general · §00
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1px 1fr',
        gap: 64,
        marginRight: 64,
      }}>
        {/* LEFT — facts */}
        <div>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(36px, 5vw, 72px)',
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            margin: '0 0 56px',
          }}>
            sobota,<br/>
            <span style={{ fontStyle: 'italic', fontWeight: 300 }}>piętnasty</span> sierpnia
          </h2>

          <FactRow label="data" value="15.08.2026" sub="sobota" />
          <FactRow label="początek" value="15:30" sub="cocktail · zbieranie gości · ceremonia 16:30" />
          <FactRow label="koniec" value="~04:00" sub="późna noc — zostajemy do rana" />
          <FactRow label="miejsce" value="Wrocław Golf Club" sub="Kryniczno, ul. Golfowa 1" />
          <FactRow label="dojazd" value="ok. 25 min od centrum" sub="własny transport · parking na miejscu" last />
        </div>

        <div className="rule-v" />

        {/* RIGHT — map */}
        <div>
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 3',
            background: 'var(--paper)',
            border: '1px solid var(--rule)',
            overflow: 'hidden',
          }}>
            <MapPlaceholder />
            <div style={{
              position: 'absolute',
              left: 16, top: 16,
              fontFamily: 'var(--sans)',
              fontSize: 9,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              background: 'var(--cream)',
              padding: '4px 8px',
            }}>fig. 01 — kryniczno</div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontStyle: 'italic', color: 'var(--ink)', lineHeight: 1.4, maxWidth: '60%' }}>
              parking i shuttle z centrum<br/>
              <span style={{ fontStyle: 'normal', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)' }}>
                — szczegóły dosypiemy bliżej daty
              </span>
            </div>
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
              google maps →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FactRow({ label, value, sub, last }) {
  return (
    <div style={{
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
  // SVG — minimalist editorial map mark
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"
         style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(46,46,46,0.06)" strokeWidth="0.5" />
        </pattern>
        <pattern id="grid2" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(46,46,46,0.12)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill="#FAF7E8" />
      <rect width="400" height="300" fill="url(#grid)" />
      <rect width="400" height="300" fill="url(#grid2)" />
      {/* roads */}
      <path d="M 0 180 Q 120 160 220 200 T 400 230" fill="none" stroke="rgba(46,46,46,0.35)" strokeWidth="1.4" />
      <path d="M 60 0 L 140 80 L 180 220 L 240 300" fill="none" stroke="rgba(46,46,46,0.25)" strokeWidth="1" />
      <path d="M 0 80 Q 200 100 400 60" fill="none" stroke="rgba(46,46,46,0.2)" strokeWidth="0.8" strokeDasharray="2 4" />
      {/* trees / golf area */}
      <ellipse cx="240" cy="150" rx="80" ry="44" fill="rgba(46,46,46,0.05)" stroke="rgba(46,46,46,0.18)" strokeDasharray="3 3" />
      {/* pin */}
      <g transform="translate(238 142)">
        <circle r="22" fill="rgba(46,46,46,0.1)" />
        <circle r="5" fill="#2E2E2E" />
        <circle r="11" fill="none" stroke="#2E2E2E" strokeWidth="0.8" />
      </g>
      <text x="260" y="142" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="2" fill="#2E2E2E">
        WROCŁAW GOLF CLUB
      </text>
      <text x="260" y="156" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="11" fill="rgba(46,46,46,0.6)">
        kryniczno
      </text>
      {/* compass */}
      <g transform="translate(360 40)">
        <line x1="0" y1="-14" x2="0" y2="14" stroke="#2E2E2E" strokeWidth="0.6" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#2E2E2E" strokeWidth="0.4" />
        <text x="0" y="-18" textAnchor="middle" fontFamily="Inter" fontSize="7" fill="#2E2E2E">N</text>
      </g>
    </svg>
  );
}

/* ── Soon / Intro ───────────────────────────────────────────────────────── */

function SectionSoon() {
  return (
    <section style={{
      padding: '88px 56px 120px 56px',
      borderTop: '1px solid var(--rule)',
      position: 'relative',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 80, marginBottom: 24 }}>
        <div className="smallcaps" style={{ color: 'var(--ink)' }}>0¹ — list do gości</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
          a note · §01
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, marginRight: 64, alignItems: 'start' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(34px, 5vw, 76px)',
            lineHeight: 0.96,
            letterSpacing: '-0.035em',
            margin: 0,
          }}>
            do zobaczenia <span style={{ fontStyle: 'italic', fontWeight: 300 }}>już</span> niedługo.
          </h2>
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
            już niedługo spotykamy się, żeby świętować razem z wami. tę stronę stworzyliśmy, żeby ułatwić nam wszystkim komunikację.
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
            wypełnijcie proszę sekcję RSVP wraz z mailem, na który będziemy wysyłać kolejne aktualizacje — plan dnia, dress code, i kilka miejsc do zobaczenia we Wrocławiu.
          </p>

          <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 32, height: 1, background: 'var(--ink)' }} />
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink)' }}>
              klara &amp; szymon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Format wesela — 01 / 02 / 03 ───────────────────────────────────────── */

function SectionFormat({ onDressCode }) {
  return (
    <section style={{
      padding: '120px 56px 140px 56px',
      borderTop: '1px solid var(--rule)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 80, marginBottom: 80 }}>
        <div className="smallcaps" style={{ color: 'var(--ink)' }}>0² — format wesela</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
          how it goes · §02
        </div>
      </div>

      <h2 style={{
        fontFamily: 'var(--serif)',
        fontWeight: 400,
        fontSize: 'clamp(40px, 6vw, 88px)',
        lineHeight: 0.95,
        letterSpacing: '-0.035em',
        margin: '0 0 80px',
        maxWidth: '11ch',
      }}>
        nie typowe polskie wesele — <span style={{ fontStyle: 'italic', fontWeight: 300 }}>cocktail</span> party.
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
        gap: 56,
        marginRight: 64,
      }}>
        <FormatColumn
          number="01"
          name="cocktail"
          tagline="lekka, przepuszczalna formuła"
          time="15:30 — 22:00"
          body="zamiast usadzenia przy stole na osiem godzin — bufet, bary, krążenie. wpadasz do tej grupy, do tamtej rozmowy, znikasz na chwilę i wracasz."
        />
        <div className="rule-v" />
        <FormatColumn
          number="02"
          name="outdoor"
          tagline="popołudnie i wczesny wieczór"
          time="słońce → zachód"
          body="ceremonia i pierwsza część w ogrodzie. trawa, drewno, długie cienie. dress code dopasowany do warunków — patrz sekcja Dress Code."
        />
        <div className="rule-v" />
        <FormatColumn
          number="03"
          name={<><span>late</span> <em>night</em></>}
          tagline="po dwudziestej drugiej"
          time="22:00 — ~04:00"
          body="przenosimy się do środka. dj, tańce, wódka, o północy tradycyjny barszcz z krokiecikiem. kończymy nad ranem — zostawcie sobie kacowy poranek."
        />
      </div>

      <div style={{ marginTop: 96, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--rule)', paddingTop: 32, marginRight: 64 }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18, color: 'var(--muted)' }}>
          dalej — co założyć?
        </div>
        <button onClick={onDressCode} className="smallcaps" style={{ color: 'var(--ink)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'none', borderBottom: '1px solid var(--ink)', paddingBottom: 2, padding: 0, paddingBottom: 2 }}>
          dress code →
        </button>
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
        <span className="smallcaps" style={{ color: 'var(--muted)' }}>{time}</span>
      </div>

      <h3 style={{
        fontFamily: 'var(--serif)',
        fontWeight: 400,
        fontSize: 36,
        lineHeight: 1,
        letterSpacing: '-0.025em',
        margin: '0 0 8px',
      }}>
        {name}
      </h3>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', marginBottom: 28 }}>
        — {tagline}
      </div>

      <p style={{
        fontFamily: 'var(--sans)',
        fontSize: 14,
        lineHeight: 1.65,
        color: 'var(--ink)',
        margin: 0,
        textWrap: 'pretty',
      }}>
        {body}
      </p>
    </div>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────── */

function SiteFooter() {
  return (
    <footer style={{
      padding: '64px 56px 56px 56px',
      borderTop: '1px solid var(--rule)',
      marginRight: 0,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 48, marginRight: 64, alignItems: 'baseline' }}>
        <Monogram size={32} />
        <div style={{ textAlign: 'center' }}>
          <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: 6 }}>edition</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16 }}>vol. 01 — summer mmxxvi</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: 6 }}>kontakt</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)' }}>klara@wedded.studio</div>
        </div>
      </div>
      <div className="rule-h" style={{ marginTop: 40, marginBottom: 24, marginRight: 64 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginRight: 64, fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>
        <span>© mmxxvi · klara &amp; szymon koprowscy</span>
        <span>made by <em style={{ fontFamily: 'var(--serif)', textTransform: 'none', letterSpacing: 0, fontSize: 13 }}>wedded</em></span>
      </div>
    </footer>
  );
}

Object.assign(window, { SectionInformacje, SectionSoon, SectionFormat, SiteFooter });
