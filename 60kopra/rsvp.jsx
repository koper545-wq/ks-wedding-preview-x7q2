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

function Field({ label, hint, error, children }) {
  return (
    <div style={{ padding: '32px 0', borderBottom: '1px solid var(--rule)' }}>
      <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: hint ? 8 : 16 }}>{label}</div>
      {hint && <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.55 }}>{hint}</div>}
      {children}
      {error && (
        <div style={{ marginTop: 10, fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--warn)' }}>
          {error}
        </div>
      )}
    </div>
  );
}

/* ── Walidacja ─────────────────────────────────────────────────────────── */

function validate(answers) {
  const e = COPY.rsvp.errors;
  const errors = {};
  const name = (answers.name || '').trim();
  if (!name) errors.name = e.nameRequired;
  else if (name.length < 2) errors.name = e.nameShort;

  if (!answers.attending) errors.attending = e.attending;

  const email = (answers.email || '').trim();
  if (email && !RSVP_EMAIL_RE.test(email)) errors.email = e.email;

  return errors;
}

/* ── Ekran po wysłaniu ─────────────────────────────────────────────────── */

function firstName(full) {
  const f = String(full || '').trim().split(/\s+/)[0] || '';
  return f ? f.charAt(0).toUpperCase() + f.slice(1).toLowerCase() : '';
}

function SuccessScreen({ answers, onReset }) {
  const c = COPY.rsvp.success;
  const yes = answers.attending === 'yes';
  const html = yes ? c.yesTitle.replace('{name}', firstName(answers.name)) : c.noTitle;
  return (
    <div style={{ maxWidth: 720 }}>
      <Kicker style={{ marginBottom: 24 }}>{c.kicker}</Kicker>
      <Rich as="h3" html={html} style={{
        fontFamily: 'var(--display)',
        fontWeight: 400,
        fontSize: 'clamp(38px, 6vw, 68px)',
        lineHeight: 1.05,
        color: 'var(--fg-strong)',
        margin: '0 0 28px',
      }} />
      <p style={{ margin: '0 0 32px', fontSize: 15, lineHeight: 1.7, color: 'var(--muted)', maxWidth: 520 }}>
        {yes ? c.yesBody : c.noBody}
      </p>
      <button type="button" onClick={onReset} className="smallcaps" style={{
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

function RSVPSection() {
  const c = COPY.rsvp;
  const f = c.fields;
  const [answers, setAnswers] = React.useState(() => loadRSVP() || {});
  const [submitted, setSubmitted] = React.useState(() => !!loadRSVP()?.submittedAt);
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
          name:      (answers.name || '').trim(),
          attending: answers.attending || '',
          email:     (answers.email || '').trim().toLowerCase(),
          source:    'web',
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => null);
        throw new Error(err?.error || `error ${r.status}`);
      }
      const result = await r.json().catch(() => null);
      if (result && result.sheets === false) console.warn('[rsvp] partial success', result);
      setSubmitted(true);
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
    setTouched(false);
    setSubmitError(null);
  };

  return (
    <Section id="rsvp" kicker={c.kicker} title={c.title}>
      {submitted ? (
        <SuccessScreen answers={answers} onReset={reset} />
      ) : (
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

            <Field label={f.email.label} hint={f.email.hint} error={touched ? errors.email : null}>
              <TextField type="email" value={answers.email} onChange={(v) => setAnswer('email', v)} placeholder={f.email.placeholder} />
            </Field>
          </div>

          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <Button onClick={submit} disabled={submitting || (touched && !valid)}>
              {submitting ? c.submitting : c.submit}
              <span style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>→</span>
            </Button>
            {submitError && (
              <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--warn)' }}>
                {submitError}
              </span>
            )}
          </div>
        </div>
      )}
    </Section>
  );
}

Object.assign(window, { RSVPSection });
