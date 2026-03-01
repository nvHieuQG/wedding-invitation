/**
 * ============================================================
 *  GOOGLE APPS SCRIPT – Wedding RSVP Backend
 *  Văn Cường & Hải Lý
 *
 *  HƯỚNG DẪN CÀI ĐẶT (làm 1 lần duy nhất):
 *  ─────────────────────────────────────────
 *  1. Vào https://sheets.google.com → tạo Google Sheet mới
 *     Đặt tên sheet tab là: RSVP  (viết hoa)
 *
 *  2. Vào menu Extensions → Apps Script
 *
 *  3. Xóa code có sẵn, dán toàn bộ code file này vào → Save
 *
 *  4. Click Deploy → New deployment
 *     - Type: Web app
 *     - Execute as: Me (your Google account)
 *     - Who has access: Anyone
 *     → Deploy → Copy URL (dạng https://script.google.com/macros/s/.../exec)
 *
 *  5. Dán URL đó vào:
 *     - js/main.js  : const SCRIPT_URL = 'URL_CỦA_BẠN'
 *     - js/admin.js : const SCRIPT_URL = 'URL_CỦA_BẠN'
 * ============================================================
 */

const SHEET_NAME = 'RSVP';

// ── Nhận dữ liệu gửi từ form RSVP ──────────────────────────
function doPost(e) {
  try {
    const raw  = e.postData ? e.postData.contents : '';
    const data = JSON.parse(raw);
    const sheet = SpreadsheetApp.getActiveSpreadsheet()
                    .getSheetByName(SHEET_NAME);

    // Tạo header nếu sheet còn trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['id','name','phone','attend','guests','message','time']);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.id      || Date.now(),
      data.name    || '',
      data.phone   || '',
      data.attend  || '',
      data.guests  || 0,
      data.message || '',
      data.time    || new Date().toISOString()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Trả về danh sách cho trang admin ───────────────────────
function doGet(e) {
  try {
    const sheet   = SpreadsheetApp.getActiveSpreadsheet()
                      .getSheetByName(SHEET_NAME);
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const rows = sheet.getRange(2, 1, lastRow - 1, 7).getValues();

    const data = rows
      .filter(function(row) { return row[0]; }) // bỏ hàng trống
      .map(function(row) {
        return {
          id:      row[0],
          name:    row[1],
          phone:   row[2],
          attend:  row[3],
          guests:  row[4],
          message: row[5],
          time:    row[6]
        };
      });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, data: [], error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
