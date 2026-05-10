/* Plan Dnia subpage */

function PlanDniaPage({ onBack }) {
  return (
    <main>
      <section style={{ padding: '120px 56px 80px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, marginBottom: 80 }}>
          <div className="smallcaps" style={{ color: 'var(--ink)' }}>05 – plan dnia</div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
            timeline · §05
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
          }}>
            <span style={{ fontStyle: 'italic', fontWeight: 300 }}>more info</span><br/>
            na miejscu
          </h1>
        </div>
      </section>

      <section style={{
        padding: '96px 56px 96px 56px',
        borderTop: '1px solid var(--rule)',
        background: 'var(--ink)',
        color: 'var(--cream)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="smallcaps" style={{ color: 'rgba(255,252,240,0.5)', marginBottom: 28 }}>
            najważniejsza informacja na ten moment
          </div>

          <h2 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: 0,
            color: 'var(--cream)',
          }}>
            <span style={{ fontStyle: 'italic', fontWeight: 300 }}>16:00</span> zaczynamy zaślubiny,<br/>
            kończymy <span style={{ fontStyle: 'italic', fontWeight: 300 }}>około 4:00</span>.
          </h2>

          <p style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 22,
            color: 'rgba(255,252,240,0.78)',
            marginTop: 40,
          }}>
            be there or be square &lt;3
          </p>
        </div>
      </section>

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
          <div className="smallcaps" style={{ color: 'var(--muted)' }}>§05 · plan dnia · k&amp;s mmxxvi</div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { PlanDniaPage });
