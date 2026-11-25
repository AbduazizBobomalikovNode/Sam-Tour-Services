const { Scenes, Markup } = require('telegraf');
const { button } = Markup;
const db = require("../db/db");
const getDate = require("../resurs/function/format");
const { REG, SHARE_PHONE } = require('../lib/labels');
const { normalizePhone } = require('../lib/phone');
const { escapeHtml } = require('../lib/html');
const { adminChatId } = require('../lib/config');

const scenesReg = new Scenes.BaseScene('scenesReg');
const startKeyboard = Markup.keyboard([[REG.register[0], REG.about[0]]]).resize();

// Qadam har foydalanuvchining o'z sessiyasida saqlanadi (ctx.session.reg)
const STEP = { PHONE: 'phone', NAME: 'name', NOTE: 'note' };

function say(ctx, text, extra) {
    return ctx.reply(text, { parse_mode: 'HTML', ...extra }).catch((err) => console.log(err));
}

scenesReg.enter(async (ctx) => {
    ctx.session.reg = { step: STEP.PHONE };
    await say(ctx,
        "<b>Рўйхатдан ўтиш</b>\n\n" +
        "Илтимос, телефон рақамингизни киритинг.\n" +
        "Масалан: <code>+998 90 123 45 67</code>\n\n" +
        `Ёки пастдаги «${SHARE_PHONE}» тугмасини босинг.`,
        Markup.keyboard([[button.contactRequest(SHARE_PHONE)], [REG.cancel[0]]]).resize());
});

scenesReg.hears(REG.cancel, async (ctx) => {
    delete ctx.session.reg;
    await say(ctx, "<b>Бош саҳифа</b>", startKeyboard);
    return ctx.scene.leave();
});

scenesReg.hears(REG.finish, async (ctx) => {
    const reg = ctx.session.reg;
    if (!reg || reg.step !== STEP.NOTE) return;
    return finish(ctx);
});

scenesReg.on('message', async (ctx) => {
    const reg = ctx.session.reg || (ctx.session.reg = { step: STEP.PHONE });
    const text = ctx.message.text;

    if (reg.step === STEP.PHONE) {
        const raw = ctx.message.contact ? ctx.message.contact.phone_number : text;
        const phone = normalizePhone(raw);
        if (!phone) {
            return say(ctx,
                "⚠️ Рақам нотўғри.\n" +
                "Илтимос, <code>+998 90 123 45 67</code> кўринишида киритинг.");
        }
        reg.phone = phone;
        reg.step = STEP.NAME;
        return say(ctx,
            "✅ Раҳмат!\nЭнди исмингизни ёзиб юборинг.",
            Markup.keyboard([[REG.cancel[0]]]).resize());
    }

    if (reg.step === STEP.NAME) {
        const name = (text || '').trim();
        const digits = name.replace(/\D/g, '');
        if (!name || name.length > 60 || digits.length > 2) {
            return say(ctx, "⚠️ Исм нотўғри.\nИлтимос, исмингизни ҳарфлар билан ёзинг.");
        }
        reg.name = name;
        reg.step = STEP.NOTE;
        return say(ctx,
            `<b>${escapeHtml(name)}</b>, маълумотларингиз қабул қилинди.\n\n` +
            "Хоҳласангиз, қўшимча маълумот ёзишингиз мумкин:\n" +
            "савол ёки сафар мақсадингиз ҳақида.\n\n" +
            `Ҳаммаси тайёр бўлса, «${REG.finish[0]}» тугмасини босинг.`,
            Markup.keyboard([[REG.finish[0]], [REG.cancel[0]]]).resize());
    }

    if (reg.step === STEP.NOTE && text) {
        const note = text.trim();
        if (note.length > 150) {
            return say(ctx, "⚠️ Қўшимча маълумот 150 белгидан ошмаслиги керак.");
        }
        reg.addition = note;
        return finish(ctx);
    }
});

async function finish(ctx) {
    const reg = ctx.session.reg;
    const contact = {
        id: ctx.from.id,
        phone: reg.phone,
        name: reg.name,
        username: ctx.from.username,
        date: getDate(),
        time: getDate(true),
    };
    if (reg.addition) contact.addition = reg.addition;
    await db.addContacts(contact);
    postGroup(ctx, contact);
    delete ctx.session.reg;
    await say(ctx,
        "✅ <b>Сиз муваффақиятли рўйхатдан ўтдингиз!</b>\n\nРаҳмат, маълумотларингиз қабул қилинди.",
        startKeyboard);
    return ctx.scene.leave();
}

async function postGroup(ctx, contact) {
    const chatId = adminChatId();
    if (!chatId) return;
    // Xabar "#<id>" bilan boshlanishi shart: admin shunga javob yozsa, mijozga yetadi
    const message = `#${contact.id} · <b>yangi kontakt</b>` +
        `\nIsmi: ${escapeHtml(contact.name)}` +
        `\nTelefon: +998${contact.phone}` +
        `\nQo'shimcha: ${escapeHtml(contact.addition || "yo'q")}` +
        `\nTelegram: ${contact.username ? '@' + escapeHtml(contact.username) : "yo'q"}` +
        `\nSana va vaqt: ${contact.date} ${contact.time}`;
    ctx.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' }).catch((err) => console.log(err));
}

module.exports = scenesReg;
