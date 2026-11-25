// Tugma yozuvlari. Foydalanuvchilar telefonida eski klaviatura qolgan bo'lishi mumkin,
// shuning uchun hears ga har doim yangi va eski yozuvlar birga beriladi.
const REG = {
    register: ['📝 Рўйхатдан ўтиш', '📝Руйхатдан утиш'],
    about: ['👨🏻‍💻 Биз ҳақимизда', '👨🏻‍💻Биз ҳақимизда'],
    cancel: ['↩️ Бекор қилиш', '↩️бекор қилиш'],
    finish: ['🔚 Якунлаш', '🔚Якунлаш'],
};
const SHARE_PHONE = '☎️ Телефон рақамни улашиш';

const ADMIN = {
    today: ['🗒 Bugungi kontaktlar', '🗒Bugungi kontaktlar'],
    all: ['📑 Barcha kontaktlar', '📑Barcha kontaktlar'],
    stats: ['📊 Bot statistikasi', '📊Bot statistikasi'],
    broadcast: ['📣 Reklama yuborish', '📣Botga reklama joylash'],
    cancel: ['↩️ Bekor qilish', '↩️bekor qilish'],
};

module.exports = { REG, SHARE_PHONE, ADMIN };
