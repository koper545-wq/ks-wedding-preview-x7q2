/**
 * 60kopra.pl — webhook RSVP → Google Sheets
 *
 * Instalacja:
 *   1. Utwórz NOWY arkusz Google Sheets (osobny od weselnego).
 *   2. Rozszerzenia → Apps Script → wklej ten plik (zastąp domyślną zawartość).
 *   3. Uruchom raz funkcję `testAuth` (▶️) i zatwierdź uprawnienia.
 *   4. Wdróż → Nowe wdrożenie → Typ: Aplikacja internetowa
 *        - Wykonaj jako: Ja
 *        - Kto ma dostęp: Wszyscy
 *   5. Skopiuj URL wdrożenia → Vercel env var SHEETS_WEBHOOK_URL (projekt 60kopra).
 *
 * Pierwszy POST sam dopisze wiersz nagłówków.
 */

const HEADERS = [
  'timestamp',
  'name',
  'attending',
  'email',
  'user_agent',
  'source',
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

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

/** Uruchom raz ręcznie, żeby zatwierdzić uprawnienia do arkusza. */
function testAuth() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  Logger.log('Otworzono: ' + sheet.getName());
}
