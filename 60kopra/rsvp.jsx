/* RSVP — krótki formularz na jednej stronie: kto, czy będzie, (opcjonalnie) email */

const RSVP_EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const RSVP_STORAGE_KEY = 'kopra60_rsvp';

function loadRSVP() {
  try {
    const raw = localStorage.getItem(RSVP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveRSVP(data) {
  try {
    localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify({ ...data, submittedAt: new Date().toISOString() }));
  } catch {}
}

/* ── Pola ──────────────────────────────────────────────────────────────── */

const rsvpInputBase = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--rule-strong)',
  padding: '12px 0',
  fontFamily: 'var(--serif)',
  fontSize: 26,
  fontWeight: 400,
  color: 'var(--fg-strong)',
  outline: 'none',
};

function TextField({ value, onChange, type = 'text', placeholder }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={rsvpInputBase}
    />
  );
}

function ChoiceField({ value, onChange, options }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              textAlign: 'left',
              background: active ? 'var(--fg)' : 'transparent',
              color: active ? 'var(--bg)' : 'var(--fg)',
              border: '1px solid ' + (active ? 'var(--fg)' : 'var(--rule-strong)'),
              borderRadius: 999,
              padding: '18px 24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'baseline',
              gap: 14,
            }}
          >
            <span style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(19px, 2.4vw, 24px)', lineHeight: 1.1 }}>{o.label}</span>
            {o.sub && (
              <span style={{ fontSize: 13, opacity: 0.65 }}>{o.sub}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, hint, error, children, reveal }) {
  return (
    <div
      className={reveal ? 'rsvp-rise' : undefined}
      style={{ padding: '32px 0', borderBottom: '1px solid var(--rule)' }}
    >
      <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: hint ? 8 : 16 }}>{label}</div>
      {hint && <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.55 }}>{hint}</div>}
      {children}
      {error && (
        <div style={{ marginTop: 10, fontSize: 14, color: 'var(--warn)' }}>
          {error}
        </div>
      )}
    </div>
  );
}

/* ── Walidacja ─────────────────────────────────────────────────────────── */

/* Pola o osobie towarzyszącej mają sens tylko dla przychodzących.
   Trzymamy to w jednym miejscu — walidacja i render pytają o to samo. */
function showsPlusOne(answers) {
  return answers.attending === 'yes';
}
function showsPlusOneName(answers) {
  return showsPlusOne(answers) && answers.plus_one === 'yes';
}

function validate(answers) {
  const e = COPY.rsvp.errors;
  const errors = {};
  const name = (answers.name || '').trim();
  if (!name) errors.name = e.nameRequired;
  else if (name.length < 2) errors.name = e.nameShort;

  if (!answers.attending) errors.attending = e.attending;

  if (showsPlusOne(answers) && !answers.plus_one) errors.plus_one = e.plusOne;

  if (showsPlusOneName(answers)) {
    const pn = (answers.plus_one_name || '').trim();
    if (!pn) errors.plus_one_name = e.plusOneName;
    else if (pn.length < 2) errors.plus_one_name = e.nameShort;
  }

  const email = (answers.email || '').trim();
  if (email && !RSVP_EMAIL_RE.test(email)) errors.email = e.email;

  return errors;
}

/* ── Ekran po wysłaniu ─────────────────────────────────────────────────── */

function firstName(full) {
  const f = String(full || '').trim().split(/\s+/)[0] || '';
  return f ? f.charAt(0).toUpperCase() + f.slice(1).toLowerCase() : '';
}

const CONFETTI_COLORS = ['#FAF4E4', '#F2E7CC', '#D9C79C', '#B9A87A'];

/* Konfetti w barwach strony — sypie się raz, po ~4 s znika i nie wraca.
   Cząstki liczone raz (useMemo), żeby rerender nie restartował animacji. */
function Confetti({ count = 26 }) {
  const pieces = React.useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    dx: (Math.random() * 2 - 1) * 90,
    dy: 180 + Math.random() * 220,
    size: 5 + Math.random() * 7,
    rot: Math.random() * 360,
    dur: 2.6 + Math.random() * 1.8,
    delay: Math.random() * 0.7,
    round: Math.random() < 0.35,
  })), [count]);

  return (
    <div className="rsvp-confetti" aria-hidden="true" style={{
      position: 'absolute',
      inset: '0 0 auto 0',
      height: 0,
      overflow: 'visible',
      pointerEvents: 'none',
    }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="rsvp-confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.42,
            borderRadius: p.round ? '50%' : 1,
            background: CONFETTI_COLORS[p.id % CONFETTI_COLORS.length],
            opacity: 0.9,
            ['--dx']: `${p.dx}px`,
            ['--dy']: `${p.dy}px`,
            ['--r']: `${p.rot}deg`,
            ['--dur']: `${p.dur}s`,
            ['--delay']: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function SuccessScreen({ answers, onReset, celebrate }) {
  const c = COPY.rsvp.success;
  const yes = answers.attending === 'yes';
  const html = yes ? c.yesTitle.replace('{name}', firstName(answers.name)) : c.noTitle;

  // Konfetti tylko przy „tak" i tylko tuż po wysłaniu — kto wraca na stronę
  // z zapisaną odpowiedzią, nie dostaje serpentyn przy każdym wejściu.
  // Montujemy je raz i zdejmujemy po animacji, żeby nie zostawały w DOM.
  const [showConfetti, setShowConfetti] = React.useState(celebrate && yes);
  React.useEffect(() => {
    if (!showConfetti) return;
    const t = setTimeout(() => setShowConfetti(false), 5200);
    return () => clearTimeout(t);
  }, [showConfetti]);

  return (
    <div style={{ maxWidth: 720, position: 'relative' }}>
      {showConfetti && <Confetti />}
      <Kicker style={{ marginBottom: 24 }}>{c.kicker}</Kicker>
      <Rich as="h3" className="rsvp-rise" html={html} style={{
        fontFamily: 'var(--display)',
        fontWeight: 400,
        fontSize: 'clamp(38px, 6vw, 68px)',
        lineHeight: 1.05,
        color: 'var(--fg-strong)',
        margin: '0 0 28px',
      }} />
      <div className="rsvp-rule" style={{ height: 1, background: 'var(--rule-strong)', margin: '0 0 28px' }} />

      <p className="rsvp-rise" style={{ margin: '0 0 32px', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', maxWidth: 520, animationDelay: '160ms' }}>
        {yes ? (answers.plus_one === 'yes' ? c.yesBodyPair : c.yesBody) : c.noBody}
      </p>
      <button type="button" onClick={onReset} className="smallcaps rsvp-rise" style={{
        animationDelay: '260ms',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: 'var(--fg)',
        borderBottom: '1px solid var(--fg)',
        paddingBottom: 3,
      }}>{c.reset}</button>
    </div>
  );
}

/* ── Formularz ─────────────────────────────────────────────────────────── */

function RSVPBlock() {
  const c = COPY.rsvp;
  const f = c.fields;
  const [answers, setAnswers] = React.useState(() => loadRSVP() || {});
  const [submitted, setSubmitted] = React.useState(() => !!loadRSVP()?.submittedAt);
  const [justSubmitted, setJustSubmitted] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(null);

  const errors = validate(answers);
  const valid = Object.keys(errors).length === 0;
  const setAnswer = (id, v) => setAnswers((a) => ({ ...a, [id]: v }));

  const submit = async () => {
    setTouched(true);
    if (!valid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    saveRSVP(answers);
    try {
      const r = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:           (answers.name || '').trim(),
          attending:      answers.attending || '',
          plus_one:       showsPlusOne(answers) ? (answers.plus_one || '') : '',
          plus_one_name:  showsPlusOneName(answers) ? (answers.plus_one_name || '').trim() : '',
          email:          (answers.email || '').trim().toLowerCase(),
          source:         'web',
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => null);
        throw new Error(err?.error || `error ${r.status}`);
      }
      const result = await r.json().catch(() => null);
      if (result && result.sheets === false) console.warn('[rsvp] partial success', result);
      setSubmitted(true);
      setJustSubmitted(true);
      const el = document.getElementById('rsvp');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      setSubmitError(c.submitError);
      console.error('[rsvp]', e);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setJustSubmitted(false);
    setTouched(false);
    setSubmitError(null);
  };

  if (submitted) return <SuccessScreen answers={answers} onReset={reset} celebrate={justSubmitted} />;

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ margin: '0 0 8px', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)' }}>{c.body}</p>
      {c.deadline && (
        <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 2.2vw, 22px)', color: 'var(--fg-strong)' }}>{c.deadline}</p>
      )}

      <div style={{ marginTop: 24, borderTop: '1px solid var(--rule)' }}>
        <Field label={f.name.label} hint={f.name.hint} error={touched ? errors.name : null}>
          <TextField value={answers.name} onChange={(v) => setAnswer('name', v)} placeholder={f.name.placeholder} />
        </Field>

        <Field label={f.attending.label} hint={f.attending.hint} error={touched ? errors.attending : null}>
          <ChoiceField
            value={answers.attending}
            onChange={(v) => setAnswer('attending', v)}
            options={['yes', 'no'].map((v) => ({
              value: v,
              label: f.attending.options[v][0],
              sub:   f.attending.options[v][1],
            }))}
          />
        </Field>

        {showsPlusOne(answers) && (
          <Field
            key="plus_one"
            label={f.plusOne.label}
            hint={f.plusOne.hint}
            error={touched ? errors.plus_one : null}
            reveal
          >
            <ChoiceField
              value={answers.plus_one}
              onChange={(v) => setAnswer('plus_one', v)}
              options={['yes', 'no'].map((v) => ({
                value: v,
                label: f.plusOne.options[v][0],
                sub:   f.plusOne.options[v][1],
              }))}
            />
          </Field>
        )}

        {showsPlusOneName(answers) && (
          <Field
            key="plus_one_name"
            label={f.plusOneName.label}
            hint={f.plusOneName.hint}
            error={touched ? errors.plus_one_name : null}
            reveal
          >
            <TextField
              value={answers.plus_one_name}
              onChange={(v) => setAnswer('plus_one_name', v)}
              placeholder={f.plusOneName.placeholder}
            />
          </Field>
        )}

        <Field label={f.email.label} hint={f.email.hint} error={touched ? errors.email : null}>
          <TextField type="email" value={answers.email} onChange={(v) => setAnswer('email', v)} placeholder={f.email.placeholder} />
        </Field>
      </div>

      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <Button onClick={submit} disabled={submitting}>
          {submitting ? c.submitting : c.submit}
          <span style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>→</span>
        </Button>
        {submitError && (
          <span style={{ fontSize: 14, color: 'var(--warn)' }}>
            {submitError}
          </span>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { RSVPBlock });
