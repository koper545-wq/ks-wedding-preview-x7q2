/* Sekcje strony. Hero odwzorowuje zaproszenie (Figma 2008:539). */

/* ── Hero = zaproszenie ────────────────────────────────────────────────── */

function Hero({ onRsvp }) {
  const c = COPY.hero;
  return (
    <header style={{ padding: '20px var(--pad-x) 64px' }}>
      <div className="invite-frame" style={{
        maxWidth: 946,
        margin: '0 auto',
        padding: 'clamp(48px, 7vw, 96px) clamp(20px, 5vw, 62px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(48px, 8vw, 96px)',
        textAlign: 'center',
      }}>

        {/* 60 / URODZINY — jeden blok tekstu, jak w Figmie: leading 1.11 na każdym
            stopniu pisma, dzięki czemu wersy stoją ciasno jeden pod drugim */}
        <h1 style={{
          fontFamily: 'var(--display)',
          fontWeight: 400,
          margin: 0,
          color: 'var(--fg-strong)',
        }}>
          <span style={{ display: 'block', fontSize: 'clamp(96px, 22vw, 260px)', lineHeight: 1.11 }}>{c.big}</span>
          <span style={{ display: 'block', fontSize: 'clamp(40px, 9.2vw, 106px)', lineHeight: 1.11 }}>{c.word}</span>
        </h1>

        {/* data · linia · miejsce · logo */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(18px, 3vw, 34px)' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(19px, 3vw, 33px)', lineHeight: 1, color: 'var(--fg-strong)' }}>
            {EVENT.dateShort}
          </div>

          <div style={{ width: '90%', height: 1, background: 'var(--fg)' }} />

          <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(19px, 3vw, 33px)', lineHeight: 1.25, color: 'var(--fg-strong)' }}>
            {EVENT.venue},<br />{EVENT.address}
          </div>

          {/* logo klubu — asset z zaproszenia, proporcje 438.174 × 88.362 */}
          <img
            src="img/wgc-logo.png"
            alt={c.logoAlt}
            width="438"
            height="88"
            style={{
              width: 'clamp(200px, 34vw, 438px)',
              height: 'auto',
              aspectRatio: '438.174 / 88.362',
              marginTop: 'clamp(6px, 1.5vw, 16px)',
            }}
          />
        </div>

        {/* prośba o RSVP + trzy hasła */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(24px, 4vw, 42px)' }}>
          <p style={{
            margin: 0,
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(15px, 2vw, 22px)',
            lineHeight: 1.5,
            color: 'var(--fg-strong)',
            maxWidth: 620,
          }}>
            {COPY.rsvp.deadline}
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(12px, 2.4vw, 28px)',
            flexWrap: 'wrap',
            fontSize: 'clamp(12px, 1.7vw, 18px)',
            color: 'var(--fg-strong)',
          }}>
            {c.badges.map(([bold, rest], i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="badge-divider" style={{ width: 1, height: 34, background: 'var(--fg)' }} />}
                <span>
                  {bold && <strong style={{ fontWeight: 700 }}>{bold} </strong>}
                  <span style={{ fontWeight: 300 }}>{rest}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* dodatki strony: odliczanie + CTA */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <Kicker>{c.countdownLabel}</Kicker>
            <Countdown />
          </div>
          <Button onClick={onRsvp}>
            {c.cta}
            <span style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>→</span>
          </Button>
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
      <p style={{ margin: '0 0 28px', maxWidth: 560, color: 'var(--muted)', fontSize: 15, lineHeight: 1.7 }}>
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
  const c = COPY.footer;
  return (
    <footer style={{ padding: '44px var(--pad-x) 60px', borderTop: '1px solid var(--rule)' }}>
      <div className="footer-meta" style={{
        maxWidth: 1000,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
      }}>
        <div className="smallcaps" style={{ color: 'var(--muted)' }}>{c.line}</div>
        <a href={`mailto:${EVENT.contactEmail}`} className="smallcaps" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          {c.contact} · {EVENT.contactEmail}
        </a>
      </div>
    </footer>
  );
}

Object.assign(window, { Hero, SectionInformacje, SectionTransport, SectionDressCode, SectionKwiaty, SiteFooter });
