// Vercel serverless function — POST /api/rsvp
// Validates, forwards to Google Sheets webhook, sends Resend confirmation email.

const ATTENDING_VALUES = new Set(['yes', 'no', 'maybe']);
const DRINKS_VALUES = new Set(['alko', 'non_alko', 'mix']);
const PLUS_ONE_VALUES = new Set(['yes', 'no']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAIL_FROM = process.env.MAIL_FROM || 'klara & szymon <kontakt@klaraiszymon.pl>';
const MAIL_REPLY_TO = process.env.MAIL_REPLY_TO || 'kontakt@klaraiszymon.pl';
const SITE_URL = process.env.SITE_URL || 'https://klaraiszymon.pl';
// Fallback recipient(s) when Sheet write fails — comma-separated emails.
// Set ADMIN_NOTIFY_EMAIL in Vercel env vars (e.g. "klara@gmail.com,szymon@gmail.com").
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || '';

function bad(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

function clean(value, max = 500) {
  if (value == null) return '';
  return String(value).slice(0, max).trim();
}

function firstName(full) {
  if (!full) return 'Kochani';
  const f = String(full).trim().split(/\s+/)[0] || '';
  return f.charAt(0).toUpperCase() + f.slice(1).toLowerCase();
}

export default async function handler(req, res) {
  // CORS / preflight (we serve same-origin but be safe)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return bad(res, 405, 'method not allowed');

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return bad(res, 400, 'invalid json'); }
  }
  if (!body || typeof body !== 'object') return bad(res, 400, 'invalid body');

  // ── normalize ──
  const data = {
    name:           clean(body.name, 120),
    attending:      clean(body.attending, 10),
    plus_one_has:   clean(body.plus_one_has, 10),
    plus_one_name:  clean(body.plus_one_name, 120),
    diet:           clean(body.diet, 1000),
    drinks:         clean(body.drinks, 20),
    email:          clean(body.email, 200).toLowerCase(),
    phone:          clean(body.phone, 40),
    user_agent:     clean(req.headers['user-agent'], 300),
    source:         clean(body.source || 'web', 60),
    lang:           (body.lang === 'en' || body.lang === 'pl') ? body.lang : 'pl',
  };
  // "na" (nie dotyczy) is a UI-only value — treat as no plus-one info provided.
  if (data.plus_one_has === 'na') {
    data.plus_one_has = '';
    data.plus_one_name = '';
  }

  // ── validate ──
  if (!data.name) return bad(res, 400, 'name required');
  if (!ATTENDING_VALUES.has(data.attending)) return bad(res, 400, 'attending invalid');
  if (!data.email || !EMAIL_RE.test(data.email)) return bad(res, 400, 'email invalid');
  if (data.attending === 'yes') {
    if (data.plus_one_has && !PLUS_ONE_VALUES.has(data.plus_one_has)) return bad(res, 400, 'plus_one_has invalid');
    if (data.drinks && !DRINKS_VALUES.has(data.drinks)) return bad(res, 400, 'drinks invalid');
  } else {
    // hide irrelevant fields
    data.plus_one_has = '';
    data.plus_one_name = '';
    data.diet = '';
    data.drinks = '';
  }

  // ── 1. Append to Google Sheet (best-effort) ──
  const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
  let sheetsOk = false, sheetsError = null;
  if (SHEETS_WEBHOOK_URL) {
    try {
      // Apps Script returns 302 redirect to googleusercontent.com — must follow with
      // POST preserved (the global fetch in node 20+ handles 302 → GET, which loses
      // the body). Workaround: use redirect:'manual' and parse the body from response.
      const r = await fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        redirect: 'follow',
      });
      sheetsOk = r.ok;
      if (r.ok) {
        try {
          const j = await r.json();
          if (j && j.ok === false) {
            sheetsOk = false;
            sheetsError = `sheets app error: ${j.error || 'unknown'}`;
          }
        } catch {
          // Apps Script returned non-JSON (HTML error page) — treat as failure
          sheetsOk = false;
          sheetsError = 'sheets returned non-json';
        }
      } else {
        sheetsError = `sheets http ${r.status}`;
      }
    } catch (err) {
      sheetsError = String(err);
    }
  } else {
    sheetsError = 'SHEETS_WEBHOOK_URL not set';
  }

  // ── 2. Send confirmation email via Resend ──
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  let emailOk = false, emailError = null;
  if (RESEND_API_KEY) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: MAIL_FROM,
          to: [data.email],
          reply_to: MAIL_REPLY_TO,
          subject: subjectFor(data, data.lang),
          html: emailHtml(data, data.lang),
          text: emailText(data, data.lang),
          tags: [
            { name: 'kind', value: 'rsvp_confirmation' },
            { name: 'attending', value: data.attending },
            { name: 'lang', value: data.lang },
          ],
        }),
      });
      emailOk = r.ok;
      if (!r.ok) {
        const txt = await r.text().catch(() => '');
        emailError = `resend http ${r.status} ${txt.slice(0, 200)}`;
      }
    } catch (err) {
      emailError = String(err);
    }
  } else {
    emailError = 'RESEND_API_KEY not set';
  }

  // ── 3. Fallback: if Sheet failed, mail raw data to admin so nothing is lost ──
  let adminNotifyOk = false, adminNotifyError = null;
  if (!sheetsOk && RESEND_API_KEY && ADMIN_NOTIFY_EMAIL) {
    try {
      const adminRecipients = ADMIN_NOTIFY_EMAIL.split(',').map(s => s.trim()).filter(Boolean);
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: MAIL_FROM,
          to: adminRecipients,
          subject: `⚠️ RSVP — Sheet failure, dane w mailu (${data.name})`,
          html: adminFallbackHtml(data, sheetsError),
          text: adminFallbackText(data, sheetsError),
          tags: [
            { name: 'kind', value: 'admin_fallback' },
          ],
        }),
      });
      adminNotifyOk = r.ok;
      if (!r.ok) {
        const txt = await r.text().catch(() => '');
        adminNotifyError = `admin notify http ${r.status} ${txt.slice(0, 200)}`;
      }
    } catch (err) {
      adminNotifyError = String(err);
    }
  }

  // Log any downstream issues so they surface in Vercel function logs.
  if (!sheetsOk) console.error('[rsvp] sheets failed', { name: data.name, email: data.email, sheetsError });
  if (!emailOk)  console.error('[rsvp] email failed',  { email: data.email, emailError });
  if (sheetsOk && emailOk) console.log('[rsvp] ok', { name: data.name, email: data.email, attending: data.attending });

  // 200 even if downstream partially failed — we logged it; UI shouldn't crash.
  return res.status(200).json({
    ok: true,
    sheets: sheetsOk,
    email: emailOk,
    adminNotified: adminNotifyOk,
    ...(sheetsError ? { sheetsError } : {}),
    ...(emailError ? { emailError } : {}),
    ...(adminNotifyError ? { adminNotifyError } : {}),
  });
}

function adminFallbackText(d, sheetsError) {
  return [
    'UWAGA: zapis do Google Sheets nie powiódł się — RSVP poniżej trzeba dopisać ręcznie.',
    `Powód: ${sheetsError || 'unknown'}`,
    '',
    '— odpowiedź —',
    `imię i nazwisko: ${d.name}`,
    `odpowiedź: ${d.attending}`,
    `osoba towarzysząca: ${d.plus_one_has || '(n/a)'} ${d.plus_one_name || ''}`,
    `dieta: ${d.diet || '(brak)'}`,
    `bar: ${d.drinks || '(n/a)'}`,
    `email: ${d.email}`,
    `telefon: ${d.phone || '(brak)'}`,
    `źródło: ${d.source}`,
    `user agent: ${d.user_agent}`,
    `czas serwera: ${new Date().toISOString()}`,
  ].join('\n');
}

function adminFallbackHtml(d, sheetsError) {
  const rows = [
    ['imię i nazwisko', d.name],
    ['odpowiedź', d.attending],
    ['osoba towarzysząca', `${d.plus_one_has || '(n/a)'} ${d.plus_one_name || ''}`],
    ['dieta', d.diet || '(brak)'],
    ['bar', d.drinks || '(n/a)'],
    ['email', d.email],
    ['telefon', d.phone || '(brak)'],
    ['źródło', d.source],
    ['user agent', d.user_agent],
    ['czas serwera', new Date().toISOString()],
  ].map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;font-family:monospace;font-size:12px;color:#666;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:6px 0;font-family:monospace;font-size:12px;color:#000;">${escapeHtml(String(v))}</td></tr>`).join('');
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;max-width:600px;margin:24px auto;padding:24px;background:#FFFCF0;border:2px solid #B36A4A;">
    <h2 style="color:#B36A4A;margin:0 0 8px;">⚠️ RSVP — Sheet write failed</h2>
    <p style="margin:0 0 16px;color:#444;">Zapis do Google Sheets nie powiódł się. Dane RSVP poniżej — dopisz ręcznie do arkusza.</p>
    <p style="margin:0 0 24px;color:#666;font-family:monospace;font-size:12px;">Powód: ${escapeHtml(sheetsError || 'unknown')}</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #ccc;border-bottom:1px solid #ccc;">${rows}</table>
  </body></html>`;
}

/* ── Email i18n ────────────────────────────────────────────────────────── */

const MAIL_T = {
  pl: {
    subjectYes:   'dzięki – widzimy się 15 sierpnia · klara & szymon',
    subjectNo:    'zapisaliśmy waszą odpowiedź · klara & szymon',
    subjectMaybe: 'czekamy na ostateczną decyzję · klara & szymon',
    docTitle:     'rsvp zapisane',
    masthead:     'rsvp · zapisane',
    greet:        (name) => `cześć ${name.toLowerCase()},`,
    bodyYes:      'mamy twoje rsvp. cieszymy się, że będziecie z nami 15 sierpnia 2026.',
    bodyNo:       'mamy twoje rsvp. żałujemy, że nie damy rady się spotkać – dziękujemy za odpowiedź.',
    bodyMaybe:    'mamy twoje rsvp. czekamy na ostateczną decyzję – daj znać do końca maja.',
    summary:      'podsumowanie:',
    summaryHead:  'podsumowanie',
    rowName:      'imię i nazwisko',
    rowAttending: 'odpowiedź',
    rowPlusOne:   'osoba towarzysząca',
    rowDiet:      'dieta / alergie',
    rowDrinks:    'bar',
    rowPhone:     'telefon',
    plusOneSolo:  'solo',
    plusOneAnon:  '(bez imienia)',
    editIntro:    'coś się zmieniło?',
    editLink:     'wypełnij formularz jeszcze raz',
    editTail:     '– nadpiszemy odpowiedź.',
    editTextLine: 'coś się zmieniło? wróć na stronę i wypełnij formularz jeszcze raz, nadpiszemy odpowiedź.',
    introYes:     'cieszymy się, że będziecie z nami. wszystkie szczegóły – dokładny adres, parking, shuttle, mapa – wyślemy na początku lipca na ten sam adres.',
    introNo:      'dzięki, że dałeś znać. jeśli coś się zmieni, wystarczy wrócić na stronę i wypełnić formularz jeszcze raz.',
    introMaybe:   'czekamy na ostateczną decyzję – postaraj się dać znać do końca maja, żebyśmy mogli domknąć listę.',
    headlineYes:  (name) => `dzięki, <em style="font-style:italic;font-weight:300;">${name.toLowerCase()}</em>.<br/><em style="font-style:italic;font-weight:300;">do</em> zobaczenia 15 sierpnia.`,
    headlineNo:   `<em style="font-style:italic;font-weight:300;">żałujemy</em>, ale rozumiemy.<br/>dzięki za odpowiedź.`,
    headlineMaybe:`<em style="font-style:italic;font-weight:300;">zapisane</em>.<br/>czekamy na decyzję.`,
    sign:         '– klara & szymon',
    disclaimer:   (url) => `dostałeś tego maila bo wypełniłeś rsvp na <a href="${url}" style="color:rgba(46,46,46,0.7);">klaraiszymon.pl</a>`,
    prettyAtt: { yes: 'tak, będziemy', no: 'nie damy rady', maybe: 'jeszcze nie wiem' },
    prettyDrk: { alko: 'alkohol (wino · cocktails · wódka)', non_alko: 'non-alco (mocktails)', mix: 'i tak, i tak' },
  },
  en: {
    subjectYes:   'thanks – see you on august 15 · klara & szymon',
    subjectNo:    'we saved your reply · klara & szymon',
    subjectMaybe: 'waiting for your final answer · klara & szymon',
    docTitle:     'rsvp saved',
    masthead:     'rsvp · saved',
    greet:        (name) => `hi ${name.toLowerCase()},`,
    bodyYes:      'we have your rsvp. we can\'t wait to celebrate with you on august 15, 2026.',
    bodyNo:       'we have your rsvp. we\'re sad we won\'t see you – thanks for letting us know.',
    bodyMaybe:    'we have your rsvp. waiting for your final answer – please let us know by end of may.',
    summary:      'summary:',
    summaryHead:  'summary',
    rowName:      'name',
    rowAttending: 'reply',
    rowPlusOne:   'plus one',
    rowDiet:      'diet / allergies',
    rowDrinks:    'bar',
    rowPhone:     'phone',
    plusOneSolo:  'solo',
    plusOneAnon:  '(no name yet)',
    editIntro:    'anything changed?',
    editLink:     'fill the form again',
    editTail:     '– we\'ll overwrite your answer.',
    editTextLine: 'anything changed? come back to the site and fill the form again, we\'ll overwrite your answer.',
    introYes:     'we can\'t wait to see you. all the details – exact address, parking, shuttle, map – will arrive by email in early july, to this same address.',
    introNo:      'thanks for letting us know. if anything changes, just come back to the site and fill the form again.',
    introMaybe:   'we\'re waiting for your final answer – please try to let us know by end of may so we can close the list.',
    headlineYes:  (name) => `thanks, <em style="font-style:italic;font-weight:300;">${name.toLowerCase()}</em>.<br/>see you on <em style="font-style:italic;font-weight:300;">august</em> 15.`,
    headlineNo:   `<em style="font-style:italic;font-weight:300;">we\'re sad</em>, but we get it.<br/>thanks for letting us know.`,
    headlineMaybe:`<em style="font-style:italic;font-weight:300;">saved</em>.<br/>waiting for your decision.`,
    sign:         '– klara & szymon',
    disclaimer:   (url) => `you got this email because you filled out the rsvp at <a href="${url}" style="color:rgba(46,46,46,0.7);">klaraiszymon.pl</a>`,
    prettyAtt: { yes: 'yes, we\'ll be there', no: 'can\'t make it', maybe: 'not sure yet' },
    prettyDrk: { alko: 'alcohol (wine · cocktails · vodka)', non_alko: 'non-alc (mocktails)', mix: 'both' },
  },
};

function mt(lang) { return MAIL_T[lang] || MAIL_T.pl; }

/* ── Email content ─────────────────────────────────────────────────────── */

function subjectFor(d, lang) {
  const t = mt(lang);
  if (d.attending === 'yes') return t.subjectYes;
  if (d.attending === 'no')  return t.subjectNo;
  return t.subjectMaybe;
}

function emailText(d, lang) {
  const t = mt(lang);
  const lines = [
    t.greet(firstName(d.name)),
    '',
    d.attending === 'yes' ? t.bodyYes : d.attending === 'no' ? t.bodyNo : t.bodyMaybe,
    '',
    t.summary,
    `· ${t.rowName}: ${d.name}`,
    `· ${t.rowAttending}: ${prettyAttending(d.attending, lang)}`,
  ];
  if (d.attending === 'yes') {
    if (d.plus_one_has === 'yes') lines.push(`· ${t.rowPlusOne}: ${d.plus_one_name || t.plusOneAnon}`);
    else if (d.plus_one_has === 'no') lines.push(`· ${t.rowPlusOne}: ${t.plusOneSolo}`);
    if (d.diet)   lines.push(`· ${t.rowDiet}: ${d.diet}`);
    if (d.drinks) lines.push(`· ${t.rowDrinks}: ${prettyDrinks(d.drinks, lang)}`);
  }
  if (d.phone) lines.push(`· ${t.rowPhone}: ${d.phone}`);
  lines.push('');
  lines.push(t.editTextLine);
  lines.push(SITE_URL + '/#rsvp');
  lines.push('');
  lines.push(t.sign);
  return lines.join('\n');
}

function prettyAttending(v, lang) {
  return mt(lang).prettyAtt[v] || v;
}
function prettyDrinks(v, lang) {
  return mt(lang).prettyDrk[v] || v;
}

function emailHtml(d, lang) {
  const t = mt(lang);
  const isYes = d.attending === 'yes';
  const isNo  = d.attending === 'no';

  const headline = isYes
    ? t.headlineYes(escapeHtml(firstName(d.name)))
    : isNo
      ? t.headlineNo
      : t.headlineMaybe;

  const intro = isYes ? t.introYes : isNo ? t.introNo : t.introMaybe;

  const summaryRows = [
    row(t.rowName, escapeHtml(d.name)),
    row(t.rowAttending, escapeHtml(prettyAttending(d.attending, lang))),
  ];
  if (isYes) {
    if (d.plus_one_has === 'yes') summaryRows.push(row(t.rowPlusOne, escapeHtml(d.plus_one_name || t.plusOneAnon)));
    else if (d.plus_one_has === 'no') summaryRows.push(row(t.rowPlusOne, escapeHtml(t.plusOneSolo)));
    if (d.diet)   summaryRows.push(row(t.rowDiet, escapeHtml(d.diet)));
    if (d.drinks) summaryRows.push(row(t.rowDrinks, escapeHtml(prettyDrinks(d.drinks, lang))));
  }
  if (d.phone) summaryRows.push(row(t.rowPhone, escapeHtml(d.phone)));

  // Site colors:
  //   --cream: hsl(51.66 36.3% 95.56%)  ≈  #F8F4E5
  //   --ink:   #2E2E2E
  //   --rule:  rgba(46,46,46,0.18)
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(t.docTitle)}</title>
</head>
<body style="margin:0;padding:0;background:#F8F4E5;font-family:Georgia,'Cormorant Garamond',serif;color:#2E2E2E;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F4E5;">
    <tr>
      <td align="center" style="padding:56px 24px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#F8F4E5;">

          <!-- masthead: monogram + small label, hairline below -->
          <tr>
            <td style="padding:0 0 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Georgia,'Cormorant Garamond',serif;font-weight:400;font-size:24px;letter-spacing:-0.06em;color:#2E2E2E;">k<span style="color:rgba(46,46,46,0.6);">·</span><em style="font-style:italic;">s</em></td>
                  <td align="right" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(46,46,46,0.62);font-weight:500;">${escapeHtml(t.masthead)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="border-top:1px solid rgba(46,46,46,0.18);font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>

          <!-- headline -->
          <tr>
            <td style="padding:56px 0 0;">
              <h1 style="margin:0;font-family:Georgia,'Cormorant Garamond',serif;font-weight:400;font-size:46px;line-height:1.02;letter-spacing:-0.035em;color:#2E2E2E;">
                ${headline}
              </h1>
            </td>
          </tr>

          <!-- intro -->
          <tr>
            <td style="padding:28px 0 8px;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.7;color:rgba(46,46,46,0.78);">
                ${escapeHtml(intro)}
              </p>
            </td>
          </tr>

          <!-- summary -->
          <tr>
            <td style="padding:48px 0 0;">
              <p style="margin:0 0 18px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(46,46,46,0.62);font-weight:500;">${escapeHtml(t.summaryHead)}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(46,46,46,0.18);">
                ${summaryRows.join('')}
              </table>
            </td>
          </tr>

          <!-- edit link -->
          <tr>
            <td style="padding:40px 0 0;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.7;color:rgba(46,46,46,0.78);">
                ${escapeHtml(t.editIntro)} <a href="${SITE_URL}/#rsvp" style="color:#2E2E2E;text-decoration:underline;text-underline-offset:3px;">${escapeHtml(t.editLink)}</a> ${escapeHtml(t.editTail)}
              </p>
            </td>
          </tr>

          <!-- footer signature -->
          <tr>
            <td style="padding:64px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #2E2E2E;width:32px;font-size:0;line-height:0;height:1px;">&nbsp;</td>
                  <td style="padding-left:16px;font-family:Georgia,'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:18px;color:#2E2E2E;">
                    klara &amp; szymon
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <p style="margin:48px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(46,46,46,0.45);font-weight:500;">
          ${t.disclaimer(SITE_URL)}
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function row(label, value) {
  return `<tr>
    <td style="padding:18px 0;border-bottom:1px solid rgba(46,46,46,0.18);font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(46,46,46,0.62);font-weight:500;width:160px;vertical-align:top;">${label}</td>
    <td style="padding:18px 0;border-bottom:1px solid rgba(46,46,46,0.18);font-family:Georgia,'Cormorant Garamond',serif;font-weight:400;font-size:20px;line-height:1.3;color:#2E2E2E;">${value}</td>
  </tr>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
