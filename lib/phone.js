// Telefon raqamni tekshiradi. To'g'ri bo'lsa 9 xonali raqamni (998 siz) qaytaradi, bo'lmasa null.
function normalizePhone(input) {
    if (input === undefined || input === null) return null;
    let tel = String(input).trim();
    if (!tel) return null;
    if (!tel.startsWith('+')) tel = '+' + tel;
    if (!tel.startsWith('+998')) return null;
    const digits = tel.slice(4).replace(/\D/g, '');
    return digits.length === 9 ? digits : null;
}

// Saqlangan raqamni ko'rsatish uchun: 901234567 -> +998 90 123 45 67
function formatPhone(stored) {
    const digits = String(stored === undefined || stored === null ? '' : stored).replace(/\D/g, '');
    const nine = digits.length === 12 && digits.startsWith('998') ? digits.slice(3) : digits;
    if (nine.length !== 9) return stored === undefined || stored === null ? '' : String(stored);
    return `+998 ${nine.slice(0, 2)} ${nine.slice(2, 5)} ${nine.slice(5, 7)} ${nine.slice(7)}`;
}

module.exports = { normalizePhone, formatPhone };
