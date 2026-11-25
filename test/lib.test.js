const test = require('node:test');
const assert = require('node:assert');
const ExcelJS = require('exceljs');
const { normalizePhone, formatPhone } = require('../lib/phone');
const { buildContactsXlsx } = require('../lib/xlsx');
const { escapeHtml } = require('../lib/html');

test('normalizePhone qabul qiladi va rad etadi', () => {
    assert.strictEqual(normalizePhone('+998 90 730 30 30'), '907303030');
    assert.strictEqual(normalizePhone('998907303030'), '907303030');
    assert.strictEqual(normalizePhone('+998 90 730'), null);
    assert.strictEqual(normalizePhone('+7 900 123 45 67'), null);
    assert.strictEqual(normalizePhone(''), null);
    assert.strictEqual(normalizePhone(undefined), null);
});

test('formatPhone raqamni chiroyli ko\'rsatadi', () => {
    assert.strictEqual(formatPhone('907303030'), '+998 90 730 30 30');
    assert.strictEqual(formatPhone(undefined), '');
});

test('escapeHtml belgilarni almashtiradi', () => {
    assert.strictEqual(escapeHtml('<b>&'), '&lt;b&gt;&amp;');
    assert.strictEqual(escapeHtml(null), '');
});

test('buildContactsXlsx to\'g\'ri qatorlar yozadi', async () => {
    const buffer = await buildContactsXlsx([
        { id: 1, name: 'Test Bir', phone: '900000001', username: 'bir', date: '2026-11-25', time: '10:00', addition: 'izoh' },
        { id: 2, name: 'Test Ikki', phone: '900000002', date: '2026-11-25', time: '11:00' },
    ]);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const sheet = wb.getWorksheet(1);
    assert.strictEqual(sheet.getCell('B3').value, 'Test Bir');
    assert.strictEqual(sheet.getCell('D3').value, '@bir');
    assert.strictEqual(sheet.getCell('D4').value, '');
    assert.strictEqual(sheet.getCell('C4').value, '+998 90 000 00 02');
    assert.strictEqual(sheet.getCell('A5').value, null);
});
