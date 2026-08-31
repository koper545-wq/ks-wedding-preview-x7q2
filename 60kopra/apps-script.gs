/**
 * 60kopra.pl — webhook RSVP → Google Sheets + potwierdzenie mailem
 *
 * Arkusz: „RSVP 60 urodziny — 07.11.2026"
 * https://docs.google.com/spreadsheets/d/10KDYhsmMakHZXwAS3UZPNGmcu5BKSvH0GjZeIDQN6iI/edit
 *
 * Projekt jest SAMODZIELNY (nie przypięty do arkusza), dlatego otwiera arkusz
 * po ID. Gdyby ktoś kiedyś wkleił ten kod w projekt przypięty do arkusza
 * (Rozszerzenia → Apps Script), wystarczy wyczyścić SHEET_ID — kod sam
 * przełączy się na aktywny arkusz.
 *
 * MAILE: wysyła je stąd MailApp, czyli konto Google właściciela skryptu.
 * Nie potrzeba Resend ani żadnej zewnętrznej usługi, klucza API czy rekordów
 * DKIM/SPF. Limit darmowego Gmaila to 100 adresatów na dobę — na urodziny
 * z zapasem. Mail leci DOPIERO po udanym zapisie wiersza, więc nikt nie
 * dostanie potwierdzenia zgłoszenia, którego nie ma w arkuszu.
 *
 * Wdrożenie: Wdróż → Zarządzaj wdrożeniami → ✏️ → Wersja: Nowa wersja
 * (to zachowuje ten sam URL /exec, który siedzi w Vercelu jako
 * SHEETS_WEBHOOK_URL). Po dołożeniu wysyłki maili trzeba raz zatwierdzić
 * nowy zakres uprawnień.
 */

const SHEET_ID = '10KDYhsmMakHZXwAS3UZPNGmcu5BKSvH0GjZeIDQN6iI';

const SITE_URL   = 'https://60kopra.pl';
const MAIL_NAME  = '60 urodziny Kopra';   // nazwa nadawcy widoczna w skrzynce
const EVENT_WHEN = 'sobota, 7 listopada 2026, 18:00';
const EVENT_WHERE_1 = 'Wrocław Golf Club';
const EVENT_WHERE_2 = 'Golfowa 2, 55-114 Kryniczno';

const HEADERS = [
  'timestamp',
  'name',
  'attending',
  'email',
  'user_agent',
  'source',
];

function getSheet() {
  const ss = SHEET_ID
    ? SpreadsheetApp.openById(SHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets()[0];
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = getSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    } else if (sheet.getLastColumn() < HEADERS.length) {
      const from = sheet.getLastColumn();
      sheet.getRange(1, from + 1, 1, HEADERS.length - from)
        .setValues([HEADERS.slice(from)])
        .setFontWeight('bold');
    }

    sheet.appendRow([
      new Date(),
      body.name || '',
      body.attending || '',
      body.email || '',
      body.user_agent || '',
      body.source || '',
    ]);

    // Potwierdzenie wysyłamy dopiero teraz — wiersz jest już w arkuszu.
    // Wywrotka maila nie może wywrócić całego zgłoszenia, stąd osobny try.
    let mail = 'skipped';
    if (body.email) {
      try {
        sendConfirmation(body);
        mail = 'sent';
      } catch (mailErr) {
        mail = 'failed: ' + String(mailErr);
        console.error('[rsvp] mail failed', mailErr);
      }
    }

    return json({ ok: true, mail: mail });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return ContentService
    .createTextOutput('60kopra rsvp endpoint — POST only')
    .setMimeType(ContentService.MimeType.TEXT);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── Potwierdzenie dla gościa ──────────────────────────────────────────── */

function firstName(full) {
  const f = String(full || '').trim().split(/\s+/)[0] || '';
  return f ? f.charAt(0).toUpperCase() + f.slice(1).toLowerCase() : '';
}

function sendConfirmation(body) {
  const yes = body.attending === 'yes';
  const name = firstName(body.name);

  MailApp.sendEmail({
    to: body.email,
    name: MAIL_NAME,
    subject: yes
      ? 'Do zobaczenia 7 listopada — 60 urodziny Kopra'
      : 'Zapisaliśmy Twoją odpowiedź — 60 urodziny Kopra',
    body: mailText(yes, name),
    htmlBody: mailHtml(yes, name),
  });
}

function mailText(yes, name) {
  const lines = [
    'Cześć ' + name + ',',
    '',
    yes
      ? 'mamy Twoje potwierdzenie. Cieszymy się, że będziesz.'
      : 'mamy Twoją odpowiedź. Szkoda, że się nie zobaczymy — dzięki, że dałeś znać.',
  ];
  if (yes) {
    lines.push(
      '',
      'Kiedy: ' + EVENT_WHEN,
      'Gdzie: ' + EVENT_WHERE_1 + ', ' + EVENT_WHERE_2,
      '',
      'Elegancki dress code · Bez kwiatów · Bezpłatny transport powrotny'
    );
  }
  lines.push(
    '',
    'Coś się zmieniło? Wypełnij formularz jeszcze raz, nadpiszemy odpowiedź:',
    SITE_URL
  );
  return lines.join('\n');
}

function mailHtml(yes, name) {
  const BG = '#233B25', FG = '#F2E7CC', STRONG = '#FAF4E4';
  const RULE = 'rgba(242,231,204,0.28)';
  const MUTED = 'rgba(242,231,204,0.72)';
  const serif = "Georgia,'Times New Roman',serif";
  const sans = "'Helvetica Neue',Arial,sans-serif";

  const headline = yes
    ? 'Dzięki, ' + esc(name) + '.<br>Do zobaczenia.'
    : 'Szkoda.<br>Dzięki za odpowiedź.';

  const lead = yes
    ? 'Mamy Twoje potwierdzenie. Cieszymy się, że będziesz.'
    : 'Mamy Twoją odpowiedź. Szkoda, że się nie zobaczymy — dzięki, że dałeś znać.';

  const details = yes ? (
    '<tr><td style="padding:36px 0 0;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ' + RULE + ';">' +
        row('KIEDY', EVENT_WHEN, RULE, FG, STRONG, sans, serif) +
        row('GDZIE', EVENT_WHERE_1 + '<br>' + EVENT_WHERE_2, RULE, FG, STRONG, sans, serif) +
      '</table>' +
      '<p style="margin:26px 0 0;font-family:' + sans + ';font-size:13px;line-height:1.7;color:' + MUTED + ';">' +
        '<strong style="color:' + STRONG + ';">Elegancki</strong> dress code &nbsp;·&nbsp; Bez kwiatów &nbsp;·&nbsp; <strong style="color:' + STRONG + ';">Bezpłatny transport</strong> powrotny' +
      '</p>' +
    '</td></tr>'
  ) : '';

  return '<!doctype html><html lang="pl"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>RSVP zapisane</title></head>' +
    '<body style="margin:0;padding:0;background:' + BG + ';">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + BG + '" style="background:' + BG + ';">' +
    '<tr><td align="center" style="padding:48px 20px;">' +
    '<table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">' +

      '<tr><td style="font-family:' + sans + ';font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:' + MUTED + ';padding-bottom:18px;">RSVP · zapisane</td></tr>' +
      '<tr><td style="border-top:1px solid ' + RULE + ';font-size:0;line-height:0;height:1px;">&nbsp;</td></tr>' +

      '<tr><td style="padding:44px 0 0;">' +
        '<h1 style="margin:0;font-family:' + serif + ';font-weight:400;font-size:38px;line-height:1.15;color:' + STRONG + ';">' + headline + '</h1>' +
      '</td></tr>' +

      '<tr><td style="padding:22px 0 0;">' +
        '<p style="margin:0;font-family:' + sans + ';font-size:15px;line-height:1.7;color:' + FG + ';">' + esc(lead) + '</p>' +
      '</td></tr>' +

      details +

      '<tr><td style="padding:40px 0 0;">' +
        '<p style="margin:0;font-family:' + sans + ';font-size:14px;line-height:1.7;color:' + MUTED + ';">' +
          'Coś się zmieniło? <a href="' + SITE_URL + '" style="color:' + STRONG + ';text-decoration:underline;">Wypełnij formularz jeszcze raz</a> — nadpiszemy odpowiedź.' +
        '</p>' +
      '</td></tr>' +

      '<tr><td style="padding:44px 0 0;">' +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' +
          '<td style="border-top:1px solid ' + STRONG + ';width:28px;font-size:0;line-height:0;height:1px;">&nbsp;</td>' +
          '<td style="padding-left:14px;font-family:' + serif + ';font-size:16px;color:' + STRONG + ';">60kopra.pl</td>' +
        '</tr></table>' +
      '</td></tr>' +

    '</table></td></tr></table></body></html>';
}

function row(label, value, RULE, FG, STRONG, sans, serif) {
  return '<tr>' +
    '<td style="padding:16px 0;border-bottom:1px solid ' + RULE + ';font-family:' + sans + ';font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(242,231,204,0.72);width:90px;vertical-align:top;">' + label + '</td>' +
    '<td style="padding:16px 0;border-bottom:1px solid ' + RULE + ';font-family:' + serif + ';font-size:18px;line-height:1.4;color:' + STRONG + ';">' + value + '</td>' +
  '</tr>';
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ── Uruchamiane ręcznie ───────────────────────────────────────────────── */

/** Zatwierdza dostęp do arkusza i do wysyłki maili. Uruchom raz po zmianie kodu. */
function testAuth() {
  const sheet = getSheet();
  Logger.log('Arkusz: ' + sheet.getParent().getName() + ' / ' + sheet.getName());
  Logger.log('Pozostały limit maili na dziś: ' + MailApp.getRemainingDailyQuota());
}

/** Wysyła próbne potwierdzenie na adres właściciela skryptu. */
function testMail() {
  const me = Session.getEffectiveUser().getEmail();
  sendConfirmation({ name: 'Jan Kowalski', attending: 'yes', email: me });
  Logger.log('Wysłano próbny mail na: ' + me);
}
