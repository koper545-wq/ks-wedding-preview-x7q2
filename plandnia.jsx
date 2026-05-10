/* Plan Dnia subpage — editorial inline timeline */

const PLAN_ITEMS = [
  {
    time: '15:30',
    line: <>cocktail hour, <em style={{ fontWeight: 300 }}>zbieranie</em> gości.</>,
    body: 'wpadacie na teren golf clubu, witamy się, lampka czegoś zimnego do ręki. ceremonia za godzinę — jest czas żeby się rozejrzeć.',
    place: 'wrocław golf club · ogród',
  },
  {
    time: '16:30',
    line: <>ceremonia <em style={{ fontWeight: 300 }}>na</em> trawie.</>,
    body: 'krótka, plenerowa, bez przedłużania. czterdzieści minut. potem przechodzimy w stronę barów.',
    place: 'ogród · pod drzewem',
  },
  {
    time: '17:30',
    line: <>start <em style={{ fontWeight: 300 }}>lajtowej</em> części na dworze.</>,
    body: 'bufet, krążące przekąski, dwa bary, długie stoły. siadacie gdzie chcecie, krążycie jak chcecie. żadnego planu stołów.',
    place: 'taras · ogród · bary',
  },
  {
    time: '22:00',
    line: <>przenosimy imprezę <em style={{ fontWeight: 300 }}>do</em> środka.</>,
    body: 'dj, parkiet, wódka. wszystko co kojarzy się z polskim weselem — tylko że dopiero o dwudziestej drugiej i w lepszych butach.',
    place: 'sala główna · parkiet',
  },
  {
    time: '00:00',
    line: <>tradycyjny <em style={{ fontWeight: 300 }}>polski</em> barszcz z krokiecikiem.</>,
    body: 'jeden ukłon w stronę formy. gorący, podany przy parkiecie, do ręki. powrót na parkiet w czasie poniżej minuty.',
    place: 'sala · midnight',
  },
  {
    time: '~04:00',
    line: <>kończymy. <em style={{ fontWeight: 300 }}>do</em> rana.</>,
    body: 'dla tych co zostają — kończymy bez ostentacji, ostatnia kolejka, taksówki w stronę wrocławia. shuttle szczegóły dosypiemy bliżej daty.',
    place: 'parking · pożegnania',
  },
];

function PlanItem({ item, index, last }) {
  return (
    <article style={{
      display: 'grid',
      gridTemplateColumns: '64px 1fr 200px',
      gap: 48,
      padding: '48px 0',
      borderBottom: last ? 'none' : '1px solid var(--rule)',
      alignItems: 'baseline',
    }}>
      <div className="smallcaps" style={{ color: 'var(--muted)', paddingTop: 18 }}>
        {String(index + 1).padStart(2, '0')}
      </div>

      <div>
        <h2 style={{
          fontFamily: 'var(--serif)',
          fontWeight: 400,
          fontSize: 'clamp(36px, 5.4vw, 80px)',
          lineHeight: 1,
          letterSpacing: '-0.035em',
          margin: 0,
        }}>
          <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--ink)' }}>{item.time}</span>
          <span style={{ display: 'inline-block', width: 24 }} />
          <span>{item.line}</span>
        </h2>
        <p style={{
          fontFamily: 'var(--sans)',
          fontSize: 14,
          lineHeight: 1.65,
          color: 'var(--ink)',
          margin: '24px 0 0',
          maxWidth: 560,
          textWrap: 'pretty',
        }}>
          {item.body}
        </p>
      </div>

      <div style={{ paddingTop: 22, textAlign: 'right' }}>
        <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: 6 }}>miejsce</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink)', lineHeight: 1.4 }}>
          {item.place}
        </div>
      </div>
    </article>
  );
}

function PlanDniaPage({ onBack }) {
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
          <div className="smallcaps" style={{ color: 'var(--ink)' }}>0³ — plan dnia</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
            timeline · §03
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
            od <span style={{ fontStyle: 'italic', fontWeight: 300 }}>cocktailu</span><br/>
            do <span style={{ fontStyle: 'italic', fontWeight: 300 }}>czwartej</span> nad ranem.
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
            sześć punktów na osi dnia. żadnego sztywnego rozpisania — żebyście wiedzieli, gdzie być i kiedy, ale bez ciśnienia.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '0 56px 80px 56px' }}>
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          {PLAN_ITEMS.map((item, i) => (
            <PlanItem key={item.time} item={item} index={i} last={i === PLAN_ITEMS.length - 1} />
          ))}
        </div>
      </section>

      {/* Outro — wide quote */}
      <section style={{
        padding: '96px 56px 96px 56px',
        borderTop: '1px solid var(--rule)',
        background: 'var(--ink)',
        color: 'var(--cream)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, alignItems: 'baseline', marginBottom: 32 }}>
          <div className="smallcaps" style={{ color: 'rgba(255,252,240,0.5)' }}>p.s.</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'rgba(255,252,240,0.5)', textAlign: 'right' }}>
            jedna prośba
          </div>
        </div>
        <h2 style={{
          fontFamily: 'var(--serif)',
          fontWeight: 400,
          fontSize: 'clamp(36px, 5.5vw, 80px)',
          lineHeight: 1,
          letterSpacing: '-0.035em',
          margin: 0,
          maxWidth: '18ch',
          color: 'var(--cream)',
        }}>
          16:30 to <span style={{ fontStyle: 'italic', fontWeight: 300 }}>twarda</span> godzina. wszystko inne — luźno.
        </h2>
        <p style={{
          fontFamily: 'var(--sans)',
          fontSize: 15,
          lineHeight: 1.7,
          color: 'rgba(255,252,240,0.72)',
          marginTop: 32,
          maxWidth: 540,
          textWrap: 'pretty',
        }}>
          ceremonia zaczyna się punktualnie o 16:30, więc na 16:00 prosimy was już na miejscu z lampką w ręku. reszta dnia jest celowo elastyczna — wpadacie i wypadacie kiedy macie siłę.
        </p>
      </section>

      {/* Pagination */}
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
          <div className="smallcaps" style={{ color: 'var(--muted)' }}>§03 · plan dnia · k&amp;s mmxxvi</div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { PlanDniaPage });
