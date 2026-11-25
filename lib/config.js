// Adminlar guruhi ID si (.env dagi ADMIN_CHAT_ID). Berilmagan bo'lsa null.
function adminChatId() {
    const raw = process.env.ADMIN_CHAT_ID;
    if (!raw || !/^-?\d+$/.test(raw.trim())) return null;
    return Number(raw.trim());
}

module.exports = { adminChatId };
