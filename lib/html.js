// Telegram HTML parse_mode uchun foydalanuvchi matnini xavfsiz qiladi.
function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

module.exports = { escapeHtml };
