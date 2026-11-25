const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ExcelJS = require('exceljs');
const { formatPhone } = require('./phone');

const TEMPLATE = path.join(__dirname, '../resurs/documents/template.xlsx');

// Har eksport uchun yangi workbook. Namuna fayldan boshlanadi, ma'lumot 3-qatordan yoziladi.
async function buildContactsXlsx(contacts) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE);
    const sheet = workbook.getWorksheet(1);
    sheet.getCell('A1').value = 'Sam Tour Services botida kontakt qoldirgan mijozlar';
    ['№', 'Ism sharifi', 'Telefon raqami', 'Telegram username', 'Telegram ID', 'Sana', 'Vaqt', "Qo'shimcha ma'lumot"]
        .forEach((t, i) => { sheet.getCell(2, i + 1).value = t; });
    contacts.forEach((c, i) => {
        const row = i + 3;
        sheet.getCell(`A${row}`).value = i + 1;
        sheet.getCell(`B${row}`).value = c.name || '';
        sheet.getCell(`C${row}`).value = formatPhone(c.phone);
        sheet.getCell(`D${row}`).value = c.username ? '@' + c.username : '';
        sheet.getCell(`E${row}`).value = c.id || '';
        sheet.getCell(`F${row}`).value = c.date || '';
        sheet.getCell(`G${row}`).value = c.time || '';
        sheet.getCell(`H${row}`).value = c.addition || '';
    });
    return Buffer.from(await workbook.xlsx.writeBuffer());
}

// Vaqtinchalik papkaga noyob nom bilan yozadi. Yuborgandan keyin removeTemp() bilan o'chiring.
async function writeTempXlsx(contacts) {
    const buffer = await buildContactsXlsx(contacts);
    const file = path.join(os.tmpdir(), `samtour-${crypto.randomUUID()}.xlsx`);
    await fs.promises.writeFile(file, buffer);
    return file;
}

function removeTemp(file) {
    return fs.promises.unlink(file).catch(() => {});
}

module.exports = { buildContactsXlsx, writeTempXlsx, removeTemp };
