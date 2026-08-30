/* Sekcje strony. Dane pochodzą z zaproszenia (Figma 2008:539), ale strona
   nie odtwarza już samego zaproszenia — to landing z RSVP na górze. */

/* ── Góra: nagłówek + od razu formularz RSVP ───────────────────────────── */

function BadgeRow() {
  return (
    <div className="badge-row" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(12px, 2.4vw, 26px)',
      flexWrap: 'wrap',
      fontSize: 'clamp(12px, 1.5vw, 15px)',
      color: 'var(--fg)',
    }}>
      {COPY.top.badges.map(([bold, rest], i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="badge-divider" style={{ width: 1, height: 22, background: 'var(--rule-strong)' }} />}
          <span>
            {bold && <strong style={{ fontWeight: 700 }}>{bold} </strong>}
            <span style={{ fontWeight: 300 }}>{rest}</span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

function TopRSVP() {
  const c = COPY.top;
  return (
    <header id="rsvp" style={{ padding: 'clamp(44px, 7vw, 88px) var(--pad-x) 88px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          fontSize: 'clamp(52px, 10vw, 132px)',
          lineHeight: 1.02,
          margin: 0,
          color: 'var(--fg-strong)',
        }}>{c.title}</h1>

        <div style={{
          marginTop: 'clamp(20px, 3vw, 32px)',
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(19px, 2.6vw, 30px)',
          lineHeight: 1.35,
          color: 'var(--fg-strong)',
        }}>
          {EVENT.dayLabel}, {EVENT.dateLabel}, {EVENT.timeLabel}<br />
          {EVENT.venue}, {EVENT.address}
        </div>

        <div style={{ marginTop: 'clamp(22px, 3vw, 30px)' }}>
          <BadgeRow />
        </div>

        {/* formularz od razu pod nagłówkiem — to jest główna akcja strony */}
        <div style={{ marginTop: 'clamp(44px, 6vw, 72px)', paddingTop: 'clamp(36px, 5vw, 56px)', borderTop: '1px solid var(--rule)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 28 }}>
            <Kicker>{COPY.rsvp.kicker}</Kicker>
            <span style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(26px, 3.6vw, 40px)',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: 'var(--fg-strong)',
            }}>{COPY.rsvp.title}</span>
          </div>
          <RSVPBlock />
        </div>

      </div>
    </header>
  );
}

/* ── Sekcje treści ─────────────────────────────────────────────────────── */

function SectionInformacje() {
  const c = COPY.informacje;
  const rows = [
    ['data',     `${EVENT.dayLabel}, ${EVENT.dateLabel}`, null],
    ['początek', EVENT.timeLabel, null],
    ['miejsce',  EVENT.venue, EVENT.address],
  ];
  return (
    <Section id="informacje" kicker={c.kicker} title={c.title}>
      {/* auto-fit zamiast sztywnych 1fr 1fr: kolumny same schodzą pod siebie,
          zanim zrobią się tak wąskie, że wartości zaczynają się łamać */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 56,
        alignItems: 'start',
      }}>
        {/* lewa: fakty, link do map, odliczanie */}
        <div>
          <p style={{ margin: '0 0 28px', color: 'var(--muted)', fontSize: 15, lineHeight: 1.7 }}>
            {c.intro}
          </p>

          <div style={{ borderTop: '1px solid var(--rule)' }}>
            {rows.map(([label, value, sub], i) => (
              <FactRow key={label} label={label} value={value} sub={sub} last={i === rows.length - 1} />
            ))}
          </div>

          <a href={EVENT.mapsUrl} target="_blank" rel="noopener" className="smallcaps" style={{
            display: 'inline-block',
            marginTop: 28,
            color: 'var(--fg)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--fg)',
            paddingBottom: 3,
          }}>{c.mapsLink}</a>

          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Kicker>{COPY.top.countdownLabel}</Kicker>
            <Countdown />
          </div>
        </div>

        {/* prawa: rysowana mapa (ta sama co na stronie weselnej — to samo miejsce) */}
        <div>
          <a href={EVENT.mapsUrl} target="_blank" rel="noopener" style={{ display: 'block' }}>
            <img
              src="img/map.jpg"
              alt={c.mapAlt}
              width="1200"
              height="1100"
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                aspectRatio: '1965 / 1802',
                objectFit: 'cover',
                border: '1px solid var(--rule)',
              }}
            />
          </a>

          {/* logo klubu — asset z zaproszenia, proporcje 438.174 × 88.362 */}
          <img
            src="img/wgc-logo.png"
            alt={COPY.top.logoAlt}
            width="438"
            height="88"
            style={{
              marginTop: 28,
              width: 'clamp(170px, 22vw, 260px)',
              height: 'auto',
              aspectRatio: '438.174 / 88.362',
              opacity: 0.9,
            }}
          />
        </div>
      </div>
    </Section>
  );
}

function SectionTransport() {
  const c = COPY.transport;
  return (
    <Section id="transport" kicker={c.kicker} title={c.title}>
      <p style={{
        margin: 0,
        maxWidth: 640,
        fontFamily: 'var(--serif)',
        fontSize: 'clamp(19px, 2.4vw, 26px)',
        lineHeight: 1.5,
        color: 'var(--fg-strong)',
      }}>{c.body}</p>

      {c.runs.length > 0 ? (
        <div style={{ marginTop: 36, borderTop: '1px solid var(--rule)' }}>
          {c.runs.map(([dir, time, note], i) => (
            <FactRow key={i} label={dir} value={time} sub={note} last={i === c.runs.length - 1} />
          ))}
        </div>
      ) : (
        <p style={{ marginTop: 28, fontSize: 15, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 560 }}>{c.pending}</p>
      )}

      {c.note && (
        <p style={{ marginTop: 16, fontSize: 15, color: 'var(--muted)', maxWidth: 560, lineHeight: 1.7 }}>{c.note}</p>
      )}
    </Section>
  );
}

function SectionDressCode() {
  const c = COPY.dresscode;
  return (
    <Section id="dresscode" kicker={c.kicker} title={c.title}>
      <div style={{
        fontFamily: 'var(--display)',
        fontSize: 'clamp(30px, 5vw, 56px)',
        lineHeight: 1.1,
        textTransform: 'uppercase',
        color: 'var(--fg-strong)',
      }}>
        {c.headline}
      </div>

      <p style={{
        margin: '24px 0 0',
        maxWidth: 620,
        fontFamily: 'var(--serif)',
        fontSize: 'clamp(19px, 2.4vw, 26px)',
        lineHeight: 1.5,
      }}>{c.body}</p>

      {c.points.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '36px 0 0', maxWidth: 620, borderTop: '1px solid var(--rule)' }}>
          {c.points.map((p, i) => (
            <li key={i} style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr',
              gap: 16,
              padding: '20px 0',
              borderBottom: i === c.points.length - 1 ? 'none' : '1px solid var(--rule)',
            }}>
              <span className="smallcaps" style={{ color: 'var(--muted)' }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: 15, lineHeight: 1.65 }}>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function SectionKwiaty() {
  const c = COPY.kwiaty;
  return (
    <Section id="kwiaty" kicker={c.kicker} title={c.title}>
      <p style={{
        margin: 0,
        maxWidth: 660,
        fontFamily: 'var(--serif)',
        fontSize: 'clamp(19px, 2.4vw, 26px)',
        lineHeight: 1.5,
        color: 'var(--fg-strong)',
      }}>{c.body}</p>
    </Section>
  );
}

function SiteFooter() {
  return (
    <footer style={{ padding: '44px var(--pad-x) 60px', borderTop: '1px solid var(--rule)' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div className="smallcaps" style={{ color: 'var(--muted)' }}>{COPY.footer.line}</div>
      </div>
    </footer>
  );
}

Object.assign(window, { TopRSVP, SectionInformacje, SectionTransport, SectionDressCode, SectionKwiaty, SiteFooter });
