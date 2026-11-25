const { Scenes, Markup } = require('telegraf');
const db = require("../db/db");
const { ADMIN } = require('../lib/labels');
const { writeTempXlsx, removeTemp } = require('../lib/xlsx');
const { adminChatId } = require('../lib/config');

const scenesAdmin = new Scenes.BaseScene('scenesAdmin');

const startKeyboard = Markup.keyboard([
    [ADMIN.today[0], ADMIN.all[0]],
    [ADMIN.stats[0], ADMIN.broadcast[0]],
]).resize();

const isCommand = (list, text) => list.includes(text);

scenesAdmin.enter(async (ctx) => {
    if (!ctx.message) return;
    if (ctx.message.caption && ctx.message.caption[0] == '#') {
        return postGroupToUser(ctx, 'adminMessegeCaption');
    }
    const command = ctx.message.text;
    if (isCommand(ADMIN.today, command)) return exportContacts(ctx, 'today');
    if (isCommand(ADMIN.all, command)) return exportContacts(ctx, 'all');
    if (isCommand(ADMIN.stats, command)) return botStatistics(ctx);
    if (isCommand(ADMIN.broadcast, command)) return botAdvertising(ctx);
    if (ctx.message.reply_to_message) return postGroupToUser(ctx);
    return ctx.reply('<b>Bosh sahifa</b>', { parse_mode: 'HTML', ...startKeyboard });
});

scenesAdmin.hears(ADMIN.all, (ctx) => exportContacts(ctx, 'all'));
scenesAdmin.hears(ADMIN.today, (ctx) => exportContacts(ctx, 'today'));
scenesAdmin.hears(ADMIN.stats, (ctx) => botStatistics(ctx));
scenesAdmin.hears(ADMIN.broadcast, (ctx) => botAdvertising(ctx));
scenesAdmin.hears(ADMIN.cancel, async (ctx) => {
    ctx.session.waitAdvertising = false;
    await ctx.reply('<b>Bosh sahifa</b>', { parse_mode: 'HTML', ...startKeyboard });
});

scenesAdmin.on("message", async (ctx) => {
    if (ctx.session.waitAdvertising) {
        ctx.session.waitAdvertising = false;
        const users = await db.getAllUsers();
        users.forEach((chat) => {
            ctx.copyMessage(chat.id).catch((err) => {
                console.log(err.response && err.response.description ? err.response.description : err);
            });
        });
        return ctx.reply(`📣 Xabar yuborilmoqda...\nFoydalanuvchilar soni: <b>${users.length}</b> ta`,
            { parse_mode: 'HTML', ...startKeyboard });
    }
    if (ctx.message.caption && ctx.message.caption[0] == '#') {
        return postGroupToUser(ctx, 'adminMessegeCaption');
    }
    if (ctx.message.text && ctx.message.text[0] == '#') return postGroupToUser(ctx, 'adminMessege');
    if (ctx.message.reply_to_message) return postGroupToUser(ctx);
    ctx.reply("Xabarni qayta ishlab bo'lmadi.", startKeyboard).catch((err) => console.log(err));
});

async function exportContacts(ctx, scope) {
    let file = null;
    try {
        const contacts = scope === 'today' ? await db.getAllContactsDate() : await db.getAllContacts();
        if (!contacts.length) {
            return ctx.reply(scope === 'today' ? "Bugun hali kontakt yo'q." : "Hali kontakt yo'q.");
        }
        file = await writeTempXlsx(contacts);
        const caption = scope === 'today' ? '🗒 Bugungi kontaktlar' : '📑 Barcha kontaktlar';
        await ctx.replyWithDocument({ source: file, filename: `kontaktlar-${scope}.xlsx` }, { caption });
    } catch (error) {
        console.error('Eksport xatosi:', error.message);
        ctx.reply("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.").catch(() => {});
    } finally {
        if (file) await removeTemp(file);
    }
}

async function botStatistics(ctx) {
    const [users, contactsDate, contacts] = await Promise.all([
        db.getAllUsers('count'), db.getAllContactsDate('count'), db.getAllContacts('count'),
    ]);
    const message = `<b>Sam Tour Services bot statistikasi</b>\n` +
        `\n👥 Bot foydalanuvchilari: <b>${users}</b> ta` +
        `\n🗒 Bugungi kontaktlar: <b>${contactsDate}</b> ta` +
        `\n📑 Barcha kontaktlar: <b>${contacts}</b> ta`;
    const chatId = adminChatId() || ctx.chat.id;
    return ctx.telegram.sendMessage(chatId, message, { parse_mode: 'HTML', ...startKeyboard })
        .catch((err) => console.log(err));
}

async function botAdvertising(ctx) {
    ctx.session.waitAdvertising = true;
    await ctx.reply("📣 <b>Reklama yuborish</b>\n\nXabarni shu chatga yuboring.\nU barcha bot foydalanuvchilariga jo'natiladi.",
        { parse_mode: 'HTML', ...Markup.keyboard([[ADMIN.cancel[0]]]).resize() });
}

async function postGroupToUser(ctx, block) {
    try {
        let user = null;
        if (block == 'adminMessege') {
            user = ctx.message.text.split(' ')[0].slice(1);
        } else if (block == 'adminMessegeCaption') {
            user = ctx.message.caption.split(' ')[0].slice(1);
        } else {
            const replied = ctx.message.reply_to_message;
            user = (replied.text || replied.caption || '').split(' ')[0].slice(1);
        }
        if (!/^\d+$/.test(user)) return;
        const chat = await ctx.telegram.getChat(user).catch(() => false);
        if (chat) {
            ctx.reply(`✅ Xabar foydalanuvchiga yuborildi: ${user}`).catch((err) => console.log(err));
            ctx.telegram.sendMessage(user, "<b>Sam Tour Services</b> adminlaridan xabar:", { parse_mode: 'HTML' })
                .catch((err) => console.log(err));
            ctx.copyMessage(user).catch((err) => console.log(err));
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = scenesAdmin;
