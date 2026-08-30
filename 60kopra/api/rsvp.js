// Vercel serverless function — POST /api/rsvp
// Waliduje, dopisuje wiersz do Google Sheets (webhook Apps Script),
// opcjonalnie wysyła potwierdzenie mailem przez Resend.

const ATTENDING_VALUES = new Set(['yes', 'no']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SITE_URL = process.env.SITE_URL || 'https://60kopra.pl';
const MAIL_FROM = process.env.MAIL_FROM || 'urodziny <kontakt@60kopra.pl>';
const MAIL_REPLY_TO = process.env.MAIL_REPLY_TO || 'kontakt@60kopra.pl';
// Awaryjny odbiorca, gdy zapis do arkusza padnie — lista maili po przecinku.
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || '';

function bad(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

function clean(value, max = 500) {
  if (value == null) return '';
  return String(value).slice(0, max).trim();
}

function firstName(full) {
  const f = String(full || '').trim().split(/\s+/)[0] || '';
  return f ? f.charAt(0).toUpperCase() + f.slice(1).toLowerCase() : '';
}

export default async function handler(req, res) {
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

  const data = {
    name:       clean(body.name, 120),
    attending:  clean(body.attending, 10),
    email:      clean(body.email, 200).toLowerCase(),
    user_agent: clean(req.headers['user-agent'], 300),
    source:     clean(body.source || 'web', 60),
  };

  if (!data.name) return bad(res, 400, 'name required');
  if (!ATTENDING_VALUES.has(data.attending)) return bad(res, 400, 'attending invalid');
  if (data.email && !EMAIL_RE.test(data.email)) return bad(res, 400, 'email invalid');

  // ── 1. Dopis do arkusza (best-effort) ──
  const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
  let sheetsOk = false, sheetsError = null;
  if (SHEETS_WEBHOOK_URL) {
    try {
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
          // Apps Script oddał nie-JSON (strona błędu) — traktujemy jak porażkę
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

  // ── 2. Potwierdzenie mailem (tylko jeśli podali email i Resend jest skonfigurowany) ──
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  let emailOk = false, emailError = null;
  if (data.email && RESEND_API_KEY) {
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
          subject: data.attending === 'yes'
            ? 'dzięki — widzimy się na urodzinach'
            : 'zapisaliśmy twoją odpowiedź',
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
  } else if (!data.email) {
    emailError = 'no email given';
  } else {
    emailError = 'RESEND_API_KEY not set';
  }

  // ── 3. Awaryjnie: arkusz padł → wyślij dane mailem do organizatora ──
  let adminNotifyOk = false, adminNotifyError = null;
  if (!sheetsOk && RESEND_API_KEY && ADMIN_NOTIFY_EMAIL) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: MAIL_FROM,
          to: ADMIN_NOTIFY_EMAIL.split(',').map((s) => s.trim()).filter(Boolean),
          subject: `⚠️ RSVP — arkusz padł, dane w mailu (${data.name})`,
          text: adminFallbackText(data, sheetsError),
          tags: [{ name: 'kind', value: 'admin_fallback' }],
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

  if (!sheetsOk) console.error('[rsvp] sheets failed', { name: data.name, sheetsError });
  if (sheetsOk) console.log('[rsvp] ok', { name: data.name, attending: data.attending });

  const diag = {
    sheets: sheetsOk,
    email: emailOk,
    adminNotified: adminNotifyOk,
    ...(sheetsError ? { sheetsError } : {}),
    ...(emailError ? { emailError } : {}),
    ...(adminNotifyError ? { adminNotifyError } : {}),
  };

  // Zgłoszenie liczy się za przyjęte tylko wtedy, gdy gdzieś wylądowało:
  // w arkuszu albo — awaryjnie — w mailu do organizatora. Jeśli ani jedno,
  // ani drugie, MUSIMY zwrócić błąd. 200 znaczyłoby dla gościa „zapisane",
  // a zgłoszenie przepadłoby bez śladu.
  if (!sheetsOk && !adminNotifyOk) {
    console.error('[rsvp] LOST — brak zapisu i brak powiadomienia', { name: data.name, ...diag });
    return res.status(503).json({ ok: false, error: 'rsvp storage unavailable', ...diag });
  }

  // Mail potwierdzający może paść bez konsekwencji — zgłoszenie jest zapisane.
  return res.status(200).json({ ok: true, ...diag });
}

function adminFallbackText(d, sheetsError) {
  return [
    'UWAGA: zapis do Google Sheets nie powiódł się — RSVP poniżej trzeba dopisać ręcznie.',
    `Powód: ${sheetsError || 'unknown'}`,
    '',
    `imię i nazwisko: ${d.name}`,
    `odpowiedź: ${d.attending}`,
    `email: ${d.email || '(brak)'}`,
    `źródło: ${d.source}`,
    `user agent: ${d.user_agent}`,
    `czas serwera: ${new Date().toISOString()}`,
  ].join('\n');
}

function emailText(d) {
  const name = firstName(d.name);
  return [
    `cześć ${name.toLowerCase()},`,
    '',
    d.attending === 'yes'
      ? 'mamy twoje potwierdzenie. cieszymy się, że będziesz.'
      : 'mamy twoją odpowiedź. szkoda, że nie damy rady się zobaczyć — dzięki, że dałeś znać.',
    '',
    'coś się zmieniło? wróć na stronę i wypełnij formularz jeszcze raz — nadpiszemy odpowiedź.',
    `${SITE_URL}/#rsvp`,
  ].join('\n');
}

function emailHtml(d) {
  const name = escapeHtml(firstName(d.name));
  const lead = d.attending === 'yes'
    ? 'mamy twoje potwierdzenie. cieszymy się, że będziesz.'
    : 'mamy twoją odpowiedź. szkoda, że nie damy rady się zobaczyć — dzięki, że dałeś znać.';
  return `<!doctype html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>rsvp zapisane</title></head>
<body style="margin:0;padding:0;background:#F8F4E5;font-family:Georgia,serif;color:#2E2E2E;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8F4E5;">
    <tr><td align="center" style="padding:56px 24px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
        <tr><td style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(46,46,46,0.62);padding-bottom:20px;">rsvp · zapisane</td></tr>
        <tr><td style="border-top:1px solid rgba(46,46,46,0.18);font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>
        <tr><td style="padding:48px 0 0;">
          <h1 style="margin:0;font-family:Georgia,serif;font-weight:400;font-size:44px;line-height:1.05;letter-spacing:-0.035em;">
            dzięki, <em style="font-weight:300;">${name}</em>.
          </h1>
        </td></tr>
        <tr><td style="padding:24px 0 0;">
          <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.7;color:rgba(46,46,46,0.78);">${escapeHtml(lead)}</p>
        </td></tr>
        <tr><td style="padding:36px 0 0;">
          <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.7;color:rgba(46,46,46,0.78);">
            coś się zmieniło? <a href="${SITE_URL}/#rsvp" style="color:#2E2E2E;">wypełnij formularz jeszcze raz</a> — nadpiszemy odpowiedź.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
