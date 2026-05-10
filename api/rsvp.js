// Vercel serverless function — POST /api/rsvp
// Validates, forwards to Google Sheets webhook, sends Resend confirmation email.

const ATTENDING_VALUES = new Set(['yes', 'no', 'maybe']);
const DRINKS_VALUES = new Set(['alko', 'non_alko', 'mix']);
const PLUS_ONE_VALUES = new Set(['yes', 'no']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAIL_FROM = process.env.MAIL_FROM || 'klara & szymon <kontakt@klaraiszymon.pl>';
const MAIL_REPLY_TO = process.env.MAIL_REPLY_TO || 'kontakt@klaraiszymon.pl';
const SITE_URL = process.env.SITE_URL || 'https://klaraiszymon.pl';

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
  };

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
      const r = await fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      sheetsOk = r.ok;
      if (!r.ok) sheetsError = `sheets http ${r.status}`;
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
          subject: subjectFor(data),
          html: emailHtml(data),
          text: emailText(data),
          tags: [
            { name: 'kind', value: 'rsvp_confirmation' },
            { name: 'attending', value: data.attending },
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

  // 200 even if downstream partially failed — we logged it; UI shouldn't crash.
  return res.status(200).json({
    ok: true,
    sheets: sheetsOk,
    email: emailOk,
    ...(sheetsError ? { sheetsError } : {}),
    ...(emailError ? { emailError } : {}),
  });
}

/* ── Email content ─────────────────────────────────────────────────────── */

function subjectFor(d) {
  if (d.attending === 'yes') return 'Dzięki — widzimy się 15 sierpnia · klara & szymon';
  if (d.attending === 'no')  return 'Zapisaliśmy Twoją odpowiedź · klara & szymon';
  return 'Czekamy na ostateczną decyzję · klara & szymon';
}

function emailText(d) {
  const lines = [
    `Cześć ${firstName(d.name)},`,
    '',
    d.attending === 'yes'
      ? 'Mamy Twoje RSVP. Cieszymy się, że będziecie z nami 15 sierpnia 2026.'
      : d.attending === 'no'
        ? 'Mamy Twoje RSVP. Żałujemy, że nie damy rady się spotkać — dziękujemy za odpowiedź.'
        : 'Mamy Twoje RSVP. Czekamy na ostateczną decyzję — daj znać do końca maja.',
    '',
    'Podsumowanie:',
    `· imię i nazwisko: ${d.name}`,
    `· odpowiedź: ${prettyAttending(d.attending)}`,
  ];
  if (d.attending === 'yes') {
    if (d.plus_one_has === 'yes') lines.push(`· osoba towarzysząca: ${d.plus_one_name || '(bez imienia)'}`);
    else if (d.plus_one_has === 'no') lines.push('· osoba towarzysząca: solo');
    if (d.diet)   lines.push(`· dieta / alergie: ${d.diet}`);
    if (d.drinks) lines.push(`· bar: ${prettyDrinks(d.drinks)}`);
  }
  if (d.phone) lines.push(`· telefon: ${d.phone}`);
  lines.push('');
  lines.push('Coś się zmieniło? Wróć na stronę i wypełnij formularz jeszcze raz, nadpiszemy odpowiedź.');
  lines.push(SITE_URL + '/#rsvp');
  lines.push('');
  lines.push('— klara & szymon');
  lines.push('15 sierpnia 2026 · wrocław');
  return lines.join('\n');
}

function prettyAttending(v) {
  if (v === 'yes')   return 'tak, będziemy';
  if (v === 'no')    return 'nie damy rady';
  if (v === 'maybe') return 'jeszcze nie wiem';
  return v;
}
function prettyDrinks(v) {
  if (v === 'alko')     return 'alko (wino, drinki, wódka)';
  if (v === 'non_alko') return 'non-alko (soki, lemoniady)';
  if (v === 'mix')      return 'i tak, i tak';
  return v;
}

function emailHtml(d) {
  const isYes = d.attending === 'yes';
  const isNo  = d.attending === 'no';

  const headline = isYes
    ? `dzięki, <em style="font-style:italic;font-weight:300;">${escapeHtml(firstName(d.name))}</em>.<br/><em style="font-style:italic;font-weight:300;">do</em> zobaczenia 15 sierpnia.`
    : isNo
      ? `<em style="font-style:italic;font-weight:300;">żałujemy</em>, ale rozumiemy.<br/>dzięki za odpowiedź.`
      : `<em style="font-style:italic;font-weight:300;">zapisane</em>.<br/>czekamy na decyzję.`;

  const intro = isYes
    ? 'Cieszymy się, że będziecie z nami. Wszystkie szczegóły — dokładny adres, parking, shuttle, mapa — wyślemy na początku lipca na ten sam adres.'
    : isNo
      ? 'Dzięki, że dałeś znać. Jeśli coś się zmieni, wystarczy wrócić na stronę i wypełnić formularz jeszcze raz.'
      : 'Czekamy na ostateczną decyzję — postaraj się dać znać do końca maja, żebyśmy mogli domknąć listę.';

  const summaryRows = [
    row('imię i nazwisko', escapeHtml(d.name)),
    row('odpowiedź',       escapeHtml(prettyAttending(d.attending))),
  ];
  if (isYes) {
    if (d.plus_one_has === 'yes') summaryRows.push(row('osoba towarzysząca', escapeHtml(d.plus_one_name || '(bez imienia)')));
    else if (d.plus_one_has === 'no') summaryRows.push(row('osoba towarzysząca', 'solo'));
    if (d.diet)   summaryRows.push(row('dieta / alergie', escapeHtml(d.diet)));
    if (d.drinks) summaryRows.push(row('bar', escapeHtml(prettyDrinks(d.drinks))));
  }
  if (d.phone) summaryRows.push(row('telefon', escapeHtml(d.phone)));

  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RSVP zapisane</title>
</head>
<body style="margin:0;padding:0;background:#F4EFE0;font-family:Georgia,'Cormorant Garamond',serif;color:#2E2E2E;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4EFE0;">
    <tr>
      <td align="center" style="padding:48px 24px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#FFFCF0;border:1px solid rgba(46,46,46,0.18);">

          <!-- masthead -->
          <tr>
            <td style="padding:36px 40px 24px;border-bottom:1px solid rgba(46,46,46,0.18);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Georgia,'Cormorant Garamond',serif;font-style:italic;font-weight:400;font-size:28px;letter-spacing:-0.02em;color:#2E2E2E;">k·s</td>
                  <td align="right" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(46,46,46,0.62);">rsvp · zapisane</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- headline -->
          <tr>
            <td style="padding:48px 40px 8px;">
              <p style="margin:0 0 18px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(46,46,46,0.62);">vol. 01 — wrocław · summer mmxxvi</p>
              <h1 style="margin:0;font-family:Georgia,'Cormorant Garamond',serif;font-weight:400;font-size:42px;line-height:1.05;letter-spacing:-0.03em;color:#2E2E2E;">
                ${headline}
              </h1>
            </td>
          </tr>

          <!-- intro -->
          <tr>
            <td style="padding:24px 40px 8px;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.65;color:rgba(46,46,46,0.78);">
                ${escapeHtml(intro)}
              </p>
            </td>
          </tr>

          <!-- summary -->
          <tr>
            <td style="padding:32px 40px 8px;">
              <p style="margin:0 0 14px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(46,46,46,0.62);">podsumowanie</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(46,46,46,0.18);">
                ${summaryRows.join('')}
              </table>
            </td>
          </tr>

          <!-- edit link -->
          <tr>
            <td style="padding:36px 40px 8px;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.6;color:rgba(46,46,46,0.78);">
                Coś się zmieniło? <a href="${SITE_URL}/#rsvp" style="color:#2E2E2E;text-decoration:underline;text-underline-offset:3px;">Wypełnij formularz jeszcze raz</a> — nadpiszemy odpowiedź.
              </p>
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="padding:48px 40px 36px;border-top:1px solid rgba(46,46,46,0.18);margin-top:36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Georgia,'Cormorant Garamond',serif;font-style:italic;font-size:18px;color:#2E2E2E;">
                    klara &amp; szymon
                  </td>
                  <td align="right" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(46,46,46,0.62);">
                    15.viii.mmxxvi · wrocław
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <p style="margin:18px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(46,46,46,0.45);">
          dostałeś tego maila bo wypełniłeś rsvp na <a href="${SITE_URL}" style="color:rgba(46,46,46,0.6);">klaraiszymon.pl</a>
        </p>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function row(label, value) {
  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid rgba(46,46,46,0.18);font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(46,46,46,0.62);width:160px;vertical-align:top;">${label}</td>
    <td style="padding:14px 0;border-bottom:1px solid rgba(46,46,46,0.18);font-family:Georgia,'Cormorant Garamond',serif;font-style:italic;font-size:18px;color:#2E2E2E;">${value}</td>
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
