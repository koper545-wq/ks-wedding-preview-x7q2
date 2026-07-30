/**
 * klara&szymon — RSVP webhook
 *
 * Wkleić to w Apps Script edytor (Sheet → Extensions → Apps Script).
 * Potem: Deploy → New deployment → Type: Web app
 *   - Execute as: Me (twoje konto)
 *   - Who has access: Anyone
 * Skopiuj URL deploymentu i wklej w Vercel jako env var SHEETS_WEBHOOK_URL.
 *
 * Pierwszy POST sam doda wiersz nagłówków, więc nic nie musisz robić ręcznie.
 */

// 'poprawiny' i 'golf' są na końcu, żeby istniejące wiersze w arkuszu
// zachowały wyrównanie kolumn — brakujące nagłówki dopisują się same.
const HEADERS = [
  'timestamp',
  'name',
  'attending',
  'plus_one_has',
  'plus_one_name',
  'diet',
  'drinks',
  'email',
  'phone',
  'user_agent',
  'source',
  'poprawiny',
  'golf',
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Ensure headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    } else if (sheet.getLastColumn() < HEADERS.length) {
      // Sheet created before new columns existed — extend the header row.
      const from = sheet.getLastColumn();
      sheet.getRange(1, from + 1, 1, HEADERS.length - from)
        .setValues([HEADERS.slice(from)])
        .setFontWeight('bold');
    }

    sheet.appendRow([
      new Date(),
      body.name || '',
      body.attending || '',
      body.plus_one_has || '',
      body.plus_one_name || '',
      body.diet || '',
      body.drinks || '',
      body.email || '',
      body.phone || '',
      body.user_agent || '',
      body.source || '',
      body.poprawiny || '',
      body.golf || '',
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
    .createTextOutput('klara&szymon rsvp endpoint — POST only')
    .setMimeType(ContentService.MimeType.TEXT);
}
