// Vercel serverless function — POST /api/rsvp
// Waliduje, dopisuje wiersz do Google Sheets (webhook Apps Script),
// opcjonalnie wysyła potwierdzenie mailem przez Resend.

const ATTENDING_VALUES = new Set(['yes', 'no']);
const YES_NO = new Set(['yes', 'no']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Używane tylko przez awaryjne powiadomienie do organizatora (gdy padnie arkusz).
const MAIL_FROM = process.env.MAIL_FROM || 'urodziny <kontakt@60kopra.pl>';
// Awaryjny odbiorca, gdy zapis do arkusza padnie — lista maili po przecinku.
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || '';

function bad(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

function clean(value, max = 500) {
  if (value == null) return '';
  return String(value).slice(0, max).trim();
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
    name:          clean(body.name, 120),
    attending:     clean(body.attending, 10),
    plus_one:      clean(body.plus_one, 10),
    plus_one_name: clean(body.plus_one_name, 120),
    email:         clean(body.email, 200).toLowerCase(),
    user_agent:    clean(req.headers['user-agent'], 300),
    source:        clean(body.source || 'web', 60),
  };

  if (!data.name) return bad(res, 400, 'name required');
  if (!ATTENDING_VALUES.has(data.attending)) return bad(res, 400, 'attending invalid');
  if (data.email && !EMAIL_RE.test(data.email)) return bad(res, 400, 'email invalid');

  if (data.attending === 'yes') {
    if (data.plus_one && !YES_NO.has(data.plus_one)) return bad(res, 400, 'plus_one invalid');
    // imię osoby towarzyszącej ma sens tylko przy „tak, we dwoje"
    if (data.plus_one !== 'yes') data.plus_one_name = '';
  } else {
    // kto nie przychodzi, nie ma osoby towarzyszącej — czyścimy, żeby
    // przypadkowe resztki ze stanu formularza nie trafiły do arkusza
    data.plus_one = '';
    data.plus_one_name = '';
  }

  // ── 1. Dopis do arkusza (best-effort) ──
  const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;
  let sheetsOk = false, sheetsError = null, mailStatus = null;
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
          } else if (j) {
            // Apps Script sam wysyła potwierdzenie i raportuje wynik:
            // 'sent' | 'skipped' (gość nie podał maila) | 'failed: …'
            mailStatus = j.mail || null;
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

  // ── 2. Potwierdzenie dla gościa ──
  // Wysyła je Apps Script (MailApp) zaraz po zapisaniu wiersza — patrz
  // apps-script.gs. Dzięki temu mail wychodzi tylko wtedy, gdy zgłoszenie
  // faktycznie wylądowało w arkuszu, i nie potrzeba tu żadnej usługi
  // zewnętrznej. Tutaj tylko przekazujemy dalej jego status.
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

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
  if (mailStatus && mailStatus.startsWith('failed')) {
    console.error('[rsvp] potwierdzenie nie wyszło', { name: data.name, mailStatus });
  }
  if (sheetsOk) console.log('[rsvp] ok', { name: data.name, attending: data.attending, mail: mailStatus });

  const diag = {
    sheets: sheetsOk,
    ...(mailStatus ? { mail: mailStatus } : {}),
    adminNotified: adminNotifyOk,
    ...(sheetsError ? { sheetsError } : {}),
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
    `osoba towarzysząca: ${d.plus_one || '(n/d)'} ${d.plus_one_name || ''}`,
    `email: ${d.email || '(brak)'}`,
    `źródło: ${d.source}`,
    `user agent: ${d.user_agent}`,
    `czas serwera: ${new Date().toISOString()}`,
  ].join('\n');
}
