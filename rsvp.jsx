/* RSVP subpage — typeform-style step-by-step + long-form variant + easter egg on submit */

const RSVP_STEPS = [
  {
    id: 'name',
    kicker: 'pytanie 01',
    label: 'jak <em>się</em> nazywacie?',
    hint: 'imię i nazwisko, tak jak wpisujemy was na liście.',
    type: 'text',
    placeholder: 'np. anna kowalska',
    required: true,
  },
  {
    id: 'attending',
    kicker: 'pytanie 02',
    label: 'będziecie <em>z</em> nami?',
    hint: 'wiemy, że to ważne pytanie. nie ma złej odpowiedzi.',
    type: 'choice',
    options: [
      { value: 'yes',   label: 'tak',           sub: 'jesteśmy, czekamy z lampką' },
      { value: 'no',    label: 'nie damy rady', sub: 'wszystko rozumiemy' },
      { value: 'maybe', label: 'jeszcze nie wiem', sub: 'damy znać do końca maja' },
    ],
    required: true,
  },
  {
    id: 'plus_one',
    kicker: 'pytanie 03',
    label: 'osoba <em>towarzysząca</em>?',
    hint: 'jeśli tak — podajcie jej imię i nazwisko.',
    type: 'plus_one',
    onlyIfAttending: true,
  },
  {
    id: 'diet',
    kicker: 'pytanie 04',
    label: 'dieta <em>albo</em> alergie?',
    hint: 'wegetarianizm, weganizm, gluten, orzechy, cokolwiek. dopiszemy do menu.',
    type: 'textarea',
    placeholder: 'jem wszystko / wegetarianka / uczulenie na orzechy …',
    onlyIfAttending: true,
  },
  {
    id: 'drinks',
    kicker: 'pytanie 05',
    label: 'do <em>baru</em> — z czy bez?',
    hint: 'po prostu żeby zamówić odpowiednie ilości.',
    type: 'choice',
    options: [
      { value: 'alko',     label: 'alko',          sub: 'wino, drinki, wódka — pełen pakiet' },
      { value: 'non_alko', label: 'non-alko',      sub: 'soki, lemoniady, mocktails' },
      { value: 'mix',      label: 'i tak, i tak',  sub: 'zależy od godziny' },
    ],
    onlyIfAttending: true,
  },
  {
    id: 'email',
    kicker: 'pytanie 06',
    label: 'jaki <em>e-mail</em>?',
    hint: 'na ten adres dosypiemy szczegóły bliżej daty — shuttle, mapy, drobiazgi.',
    type: 'email',
    placeholder: 'imie@domena.pl',
    required: true,
  },
  {
    id: 'phone',
    kicker: 'pytanie 07',
    label: 'a <em>telefon</em>?',
    hint: 'na wszelki wypadek. nie będziemy dzwonić bez powodu, słowo.',
    type: 'tel',
    placeholder: '+48 600 000 000',
  },
];

/* ── Storage helpers ───────────────────────────────────────────────────── */

const RSVP_STORAGE_KEY = 'ks2026_rsvp';

function loadRSVP() {
  try {
    const raw = localStorage.getItem(RSVP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveRSVP(data) {
  try {
    localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify({
      ...data,
      submittedAt: new Date().toISOString(),
    }));
  } catch {}
}

/* ── Field components ──────────────────────────────────────────────────── */

const inputBase = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--rule-strong)',
  padding: '14px 0',
  fontFamily: 'var(--serif)',
  fontSize: 28,
  fontWeight: 300,
  color: 'var(--ink)',
  outline: 'none',
  fontStyle: 'italic',
};

function TextField({ value, onChange, type = 'text', placeholder, autoFocus, onEnter }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (autoFocus && ref.current) ref.current.focus(); }, [autoFocus]);
  return (
    <input
      ref={ref}
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter(); }}
      style={inputBase}
    />
  );
}

function TextArea({ value, onChange, placeholder, autoFocus }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (autoFocus && ref.current) ref.current.focus(); }, [autoFocus]);
  return (
    <textarea
      ref={ref}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      style={{
        ...inputBase,
        fontSize: 22,
        resize: 'none',
        lineHeight: 1.5,
      }}
    />
  );
}

function ChoiceField({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
      {options.map((opt, i) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr auto',
              alignItems: 'baseline',
              gap: 18,
              padding: '20px 22px',
              background: isActive ? 'var(--ink)' : 'transparent',
              color: isActive ? 'var(--cream)' : 'var(--ink)',
              border: '1px solid ' + (isActive ? 'var(--ink)' : 'var(--rule-strong)'),
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 160ms ease',
              fontFamily: 'var(--sans)',
            }}
          >
            <span style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              opacity: 0.6,
            }}>
              {String.fromCharCode(97 + i)}.
            </span>
            <span style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 26,
              lineHeight: 1.1,
            }}>
              {opt.label}
            </span>
            <span className="smallcaps" style={{
              fontSize: 10,
              color: isActive ? 'rgba(255,252,240,0.65)' : 'var(--muted)',
              letterSpacing: '0.18em',
              textAlign: 'right',
            }}>
              {opt.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PlusOneField({ value, onChange }) {
  // value: { has: 'yes'|'no'|null, name: string }
  const v = value || { has: null, name: '' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { val: 'yes', label: 'tak, przyjdę z kimś' },
          { val: 'no',  label: 'przyjdę solo' },
        ].map((o) => {
          const isActive = v.has === o.val;
          return (
            <button key={o.val} type="button"
              onClick={() => onChange({ ...v, has: o.val })}
              style={{
                background: isActive ? 'var(--ink)' : 'transparent',
                color: isActive ? 'var(--cream)' : 'var(--ink)',
                border: '1px solid ' + (isActive ? 'var(--ink)' : 'var(--rule-strong)'),
                padding: '14px 22px',
                cursor: 'pointer',
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontWeight: 300,
                fontSize: 20,
              }}>
              {o.label}
            </button>
          );
        })}
      </div>
      {v.has === 'yes' && (
        <div>
          <div className="smallcaps" style={{ color: 'var(--muted)', marginBottom: 8 }}>
            imię i nazwisko osoby towarzyszącej
          </div>
          <TextField
            value={v.name}
            onChange={(name) => onChange({ ...v, name })}
            placeholder="np. piotr nowak"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

/* ── Validators ────────────────────────────────────────────────────────── */

function isStepValid(step, value, answers) {
  // hidden steps are auto-valid
  if (step.onlyIfAttending && answers.attending && answers.attending !== 'yes') return true;

  if (step.type === 'choice') return !!value;
  if (step.type === 'plus_one') {
    if (!value || !value.has) return !step.required ? true : false;
    if (value.has === 'yes' && !value.name?.trim()) return false;
    return true;
  }
  if (step.type === 'email') {
    if (!step.required && !value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
  }
  if (step.type === 'tel') {
    if (!step.required && !value) return true;
    return (value || '').replace(/\D/g, '').length >= 6;
  }
  if (step.type === 'textarea' || step.type === 'text') {
    if (!step.required && !value) return true;
    return !!(value && value.trim());
  }
  return true;
}

function activeSteps(answers) {
  return RSVP_STEPS.filter((s) => {
    if (s.onlyIfAttending && answers.attending && answers.attending !== 'yes') return false;
    return true;
  });
}

/* ── Step renderer ─────────────────────────────────────────────────────── */

function StepBody({ step, value, onChange, onEnter }) {
  if (step.type === 'choice')   return <ChoiceField value={value} onChange={onChange} options={step.options} />;
  if (step.type === 'plus_one') return <PlusOneField value={value} onChange={onChange} />;
  if (step.type === 'textarea') return <TextArea value={value} onChange={onChange} placeholder={step.placeholder} autoFocus />;
  return <TextField value={value} onChange={onChange} type={step.type} placeholder={step.placeholder} autoFocus onEnter={onEnter} />;
}

function StepView({ step, idx, total, value, onChange, onNext, onPrev, canAdvance }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 32,
      maxWidth: 720,
      margin: '0 auto',
    }}>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <span className="smallcaps" style={{ color: 'var(--muted)' }}>
          {step.kicker}
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.18em',
          color: 'var(--muted)',
          textTransform: 'uppercase',
        }}>
          {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </header>

      <h2 style={{
        fontFamily: 'var(--serif)',
        fontWeight: 400,
        fontSize: 'clamp(40px, 6vw, 72px)',
        lineHeight: 1,
        letterSpacing: '-0.035em',
        margin: 0,
        textWrap: 'balance',
      }}
        dangerouslySetInnerHTML={{ __html: step.label.replace(/<em>/g, '<em style="font-weight:300;">') }}
      />

      <p style={{
        fontFamily: 'var(--serif)',
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: 18,
        color: 'var(--muted)',
        margin: 0,
        maxWidth: 540,
        lineHeight: 1.4,
      }}>
        {step.hint}
      </p>

      <div style={{ marginTop: 8 }}>
        <StepBody step={step} value={value} onChange={onChange} onEnter={() => { if (canAdvance) onNext(); }} />
      </div>

      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
        <button type="button" onClick={onPrev} disabled={idx === 0} style={{
          background: 'transparent', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', padding: 0,
          color: idx === 0 ? 'var(--muted)' : 'var(--ink)',
          opacity: idx === 0 ? 0.4 : 1,
          display: 'inline-flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 18 }}>←</span>
          <span className="smallcaps">poprzednie</span>
        </button>

        <button type="button" onClick={onNext} disabled={!canAdvance} style={{
          background: canAdvance ? 'var(--ink)' : 'transparent',
          color: canAdvance ? 'var(--cream)' : 'var(--muted)',
          border: '1px solid ' + (canAdvance ? 'var(--ink)' : 'var(--rule-strong)'),
          padding: '16px 28px',
          cursor: canAdvance ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--sans)',
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
        }}>
          {idx === total - 1 ? 'wyślij rsvp' : 'dalej'}
          <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16 }}>→</span>
        </button>
      </footer>
    </div>
  );
}

/* ── Long-form variant (all questions on one page) ─────────────────────── */

function LongForm({ answers, setAnswer, onSubmit, canSubmit }) {
  const visible = activeSteps(answers);
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      {visible.map((step, i) => (
        <div key={step.id} style={{
          padding: '40px 0',
          borderBottom: i === visible.length - 1 ? 'none' : '1px solid var(--rule)',
        }}>
          <header style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
            <span className="smallcaps" style={{ color: 'var(--muted)' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ flex: 1, height: 1, background: 'var(--rule)' }} />
          </header>
          <h3 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(28px, 3.6vw, 40px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 8px',
          }}
            dangerouslySetInnerHTML={{ __html: step.label.replace(/<em>/g, '<em style="font-weight:300;">') }}
          />
          <p style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
            fontSize: 15, color: 'var(--muted)', margin: '0 0 18px', maxWidth: 540,
          }}>
            {step.hint}
          </p>
          <StepBody
            step={step}
            value={answers[step.id]}
            onChange={(v) => setAnswer(step.id, v)}
          />
        </div>
      ))}

      <div style={{ marginTop: 40, textAlign: 'right' }}>
        <button type="button" onClick={onSubmit} disabled={!canSubmit} style={{
          background: canSubmit ? 'var(--ink)' : 'transparent',
          color: canSubmit ? 'var(--cream)' : 'var(--muted)',
          border: '1px solid ' + (canSubmit ? 'var(--ink)' : 'var(--rule-strong)'),
          padding: '18px 32px',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--sans)',
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}>
          wyślij rsvp →
        </button>
      </div>
    </div>
  );
}

/* ── Easter egg success screen ─────────────────────────────────────────── */

function ConfettiPetals() {
  // CSS-only floating "confetti" — small petal SVGs drifting down on stagger.
  const petals = React.useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 5 + Math.random() * 4,
      size: 8 + Math.random() * 14,
      rotate: Math.random() * 360,
      hue: ['#C99B92', '#9DA98F', '#B36A4A', '#C7B59A', '#7C7B4E'][i % 5],
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <style>{`
        @keyframes ks-petal-fall {
          0%   { transform: translateY(-10vh) rotate(var(--r)) ; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(calc(var(--r) + 540deg)); opacity: 0; }
        }
      `}</style>
      {petals.map((p) => (
        <div key={p.id} style={{
          position: 'absolute',
          top: 0,
          left: `${p.left}%`,
          width: p.size,
          height: p.size,
          background: p.hue,
          borderRadius: '50% 8% 50% 8%',
          opacity: 0.85,
          animation: `ks-petal-fall ${p.duration}s linear ${p.delay}s infinite`,
          ['--r']: `${p.rotate}deg`,
        }} />
      ))}
    </div>
  );
}

function SuccessScreen({ answers, onReset, onBack }) {
  const isComing = answers.attending === 'yes';
  return (
    <section style={{
      position: 'relative',
      minHeight: '70vh',
      padding: '120px 56px 96px 56px',
      borderTop: '1px solid var(--rule)',
      background: 'var(--ink)',
      color: 'var(--cream)',
      overflow: 'hidden',
    }}>
      <ConfettiPetals />

      <div style={{ position: 'relative', maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <div className="smallcaps" style={{ color: 'rgba(255,252,240,0.5)', marginBottom: 28 }}>
          rsvp · zapisane
        </div>

        <h1 style={{
          fontFamily: 'var(--serif)',
          fontWeight: 400,
          fontSize: 'clamp(56px, 8vw, 120px)',
          lineHeight: 0.94,
          letterSpacing: '-0.04em',
          margin: 0,
          color: 'var(--cream)',
        }}>
          {isComing ? (
            <>
              dzięki, <span style={{ fontStyle: 'italic', fontWeight: 300 }}>{firstName(answers.name)}</span>.<br/>
              <span style={{ fontStyle: 'italic', fontWeight: 300 }}>do</span> zobaczenia 15 sierpnia.
            </>
          ) : answers.attending === 'no' ? (
            <>
              <span style={{ fontStyle: 'italic', fontWeight: 300 }}>żałujemy</span>, ale rozumiemy.<br/>
              dzięki za odpowiedź.
            </>
          ) : (
            <>
              <span style={{ fontStyle: 'italic', fontWeight: 300 }}>zapisane</span>.<br/>
              czekamy <span style={{ fontStyle: 'italic', fontWeight: 300 }}>na</span> ostateczną decyzję.
            </>
          )}
        </h1>

        <p style={{
          fontFamily: 'var(--sans)',
          fontSize: 15,
          lineHeight: 1.7,
          color: 'rgba(255,252,240,0.72)',
          marginTop: 36,
          maxWidth: 480,
          marginInline: 'auto',
          textWrap: 'pretty',
        }}>
          {isComing
            ? 'wszystkie szczegóły — dokładny adres, parking, shuttle, mapa — wyślemy mailem na początku lipca. jeśli coś się zmieni, dajcie znać.'
            : 'jeśli coś się zmieni — wystarczy wrócić tutaj i wypełnić formularz jeszcze raz. nadpiszemy odpowiedź.'}
        </p>

        <div style={{ marginTop: 56, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onBack} style={{
            background: 'transparent',
            color: 'var(--cream)',
            border: '1px solid rgba(255,252,240,0.4)',
            padding: '16px 28px',
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}>
            ← powrót na cover
          </button>
          <button onClick={onReset} style={{
            background: 'transparent',
            color: 'rgba(255,252,240,0.6)',
            border: 'none',
            padding: '16px 8px',
            cursor: 'pointer',
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 15,
            textDecoration: 'underline',
            textUnderlineOffset: 4,
          }}>
            edytuj odpowiedzi
          </button>
        </div>
      </div>
    </section>
  );
}

function firstName(full) {
  if (!full) return 'kochani';
  return (full.split(/\s+/)[0] || '').toLowerCase();
}

/* ── Main RSVP page ────────────────────────────────────────────────────── */

function RSVPPage({ onBack, variant = 'steps' }) {
  const [answers, setAnswers] = React.useState(() => loadRSVP() || {});
  const [submitted, setSubmitted] = React.useState(() => !!loadRSVP()?.submittedAt);
  const [stepIdx, setStepIdx] = React.useState(0);

  const visible = activeSteps(answers);
  const totalSteps = visible.length;
  const safeStepIdx = Math.min(stepIdx, totalSteps - 1);
  const currentStep = visible[safeStepIdx];

  const setAnswer = (id, v) => setAnswers((a) => ({ ...a, [id]: v }));

  const canAdvanceStep = currentStep ? isStepValid(currentStep, answers[currentStep.id], answers) : false;

  const allValid = visible.every((s) => isStepValid(s, answers[s.id], answers));

  const submit = () => {
    saveRSVP(answers);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setSubmitted(false);
    setStepIdx(0);
  };

  // After submit
  if (submitted) {
    return (
      <main>
        <RSVPCover variant={variant} compact />
        <SuccessScreen answers={answers} onReset={reset} onBack={onBack} />
        <PaginationBack onBack={onBack} />
      </main>
    );
  }

  // Steps variant
  if (variant === 'steps') {
    return (
      <main>
        <RSVPCover variant={variant} />
        <section style={{ padding: '72px 56px 96px 56px', borderTop: '1px solid var(--rule)' }}>
          <ProgressBar idx={safeStepIdx} total={totalSteps} />
          <div style={{ marginTop: 56 }}>
            <StepView
              step={currentStep}
              idx={safeStepIdx}
              total={totalSteps}
              value={answers[currentStep.id]}
              onChange={(v) => setAnswer(currentStep.id, v)}
              onNext={() => {
                if (safeStepIdx === totalSteps - 1) submit();
                else setStepIdx(safeStepIdx + 1);
              }}
              onPrev={() => setStepIdx(Math.max(0, safeStepIdx - 1))}
              canAdvance={canAdvanceStep}
            />
          </div>
        </section>
        <PaginationBack onBack={onBack} />
      </main>
    );
  }

  // Long-form variant
  return (
    <main>
      <RSVPCover variant={variant} />
      <section style={{ padding: '72px 56px 96px 56px', borderTop: '1px solid var(--rule)' }}>
        <LongForm
          answers={answers}
          setAnswer={setAnswer}
          onSubmit={submit}
          canSubmit={allValid}
        />
      </section>
      <PaginationBack onBack={onBack} />
    </main>
  );
}

function ProgressBar({ idx, total }) {
  const pct = ((idx) / Math.max(1, total - 1)) * 100;
  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span className="smallcaps" style={{ color: 'var(--muted)' }}>postęp</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>
          {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      <div style={{ position: 'relative', height: 1, background: 'var(--rule)' }}>
        <div style={{
          position: 'absolute', left: 0, top: -0.5, height: 2,
          width: `${pct}%`, background: 'var(--ink)',
          transition: 'width 320ms cubic-bezier(.2,.8,.2,1)',
        }} />
      </div>
    </div>
  );
}

function RSVPCover({ variant, compact }) {
  return (
    <section style={{ padding: compact ? '64px 56px 32px 56px' : '80px 56px 56px 56px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, marginTop: 40, marginBottom: compact ? 0 : 32 }}>
        <div className="smallcaps" style={{ color: 'var(--ink)' }}>0⁴ — rsvp</div>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', textAlign: 'right' }}>
          {variant === 'long' ? 'jeden ekran · §04' : 'krok po kroku · §04'}
        </div>
      </div>

      {!compact && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'end', marginTop: 24 }}>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 'clamp(56px, 9vw, 144px)',
            lineHeight: 0.92,
            letterSpacing: '-0.04em',
            margin: 0,
          }}>
            dajcie <span style={{ fontStyle: 'italic', fontWeight: 300 }}>znać</span><br/>
            czy <span style={{ fontStyle: 'italic', fontWeight: 300 }}>będziecie</span>.
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
            siedem krótkich pytań, dwie minuty. odpowiedzi zapisują się lokalnie, więc możecie wrócić i edytować, jeśli coś się zmieni.
          </p>
        </div>
      )}
    </section>
  );
}

function PaginationBack({ onBack }) {
  return (
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
        <div className="smallcaps" style={{ color: 'var(--muted)' }}>§04 · rsvp · k&amp;s mmxxvi</div>
      </div>
    </section>
  );
}

Object.assign(window, { RSVPPage });
