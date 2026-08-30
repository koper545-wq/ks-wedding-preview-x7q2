/**
 * 60kopra.pl — webhook RSVP → Google Sheets
 *
 * Arkusz: „RSVP 60 urodziny — 07.11.2026"
 * https://docs.google.com/spreadsheets/d/10KDYhsmMakHZXwAS3UZPNGmcu5BKSvH0GjZeIDQN6iI/edit
 *
 * Projekt jest SAMODZIELNY (nie przypięty do arkusza), dlatego otwiera arkusz
 * po ID. Gdyby ktoś kiedyś wkleił ten kod w projekt przypięty do arkusza
 * (Rozszerzenia → Apps Script), wystarczy wyczyścić SHEET_ID — kod sam
 * przełączy się na aktywny arkusz.
 *
 * Wdrożenie: Wdróż → Nowe wdrożenie → Aplikacja internetowa
 *   - Wykonaj jako: Ja
 *   - Kto ma dostęp: Wszyscy
 * URL wdrożenia (/exec) ląduje w Vercelu jako SHEETS_WEBHOOK_URL.
 *
 * Pierwszy POST sam dopisze wiersz nagłówków.
 */

const SHEET_ID = '10KDYhsmMakHZXwAS3UZPNGmcu5BKSvH0GjZeIDQN6iI';

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

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('60kopra rsvp endpoint — POST only')
    .setMimeType(ContentService.MimeType.TEXT);
}

/** Uruchom raz ręcznie, żeby zatwierdzić dostęp do arkusza (scope Drive). */
function testAuth() {
  const sheet = getSheet();
  Logger.log('Otworzono: ' + sheet.getParent().getName() + ' / ' + sheet.getName());
}
