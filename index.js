require('dotenv').config();
const { Telegraf, Markup, session, Scenes } = require("telegraf");
const fs = require('fs');
const path = require('path');
const express = require('express');

const reg = require('./router/reg');
const admin = require('./router/admin');
const db = require("./db/db");
const { REG } = require('./lib/labels');
const { escapeHtml } = require('./lib/html');
const { adminChatId } = require('./lib/config');
const { createPanel } = require('./lib/panel');

const PORT = Number(process.env.PORT) || 8080;
const BOT_TOKEN = process.env.BOT_TOKEN;

const startKeyboard = Markup.keyboard([[REG.register[0], REG.about[0]]]).resize();

function createBot(token) {
    const bot = new Telegraf(token);

    // Log mijozlarning telefon raqamlarini ham yozadi, shuning uchun faqat DEBUG=1 da yoqiladi
    if (process.env.DEBUG === '1') bot.use(Telegraf.log());
    bot.use(session({ defaultSession: () => ({}) }));
    const stage = new Scenes.Stage([reg, admin]);
    bot.use(stage.middleware());
    bot.use((ctx, next) => {
        ctx.session = ctx.session ? ctx.session : {};
        return next();
    });
    bot.use((ctx, next) => {
        const adminId = adminChatId();
        if (adminId && ctx.chat && ctx.chat.id === adminId && ctx.chat.type === "supergroup") {
            return ctx.scene.enter('scenesAdmin');
        }
        return next();
    });

    bot.start(async (ctx) => {
        db.addUser(ctx.from.id);
        const name = escapeHtml(ctx.from.first_name || '');
        ctx.reply(`<b>Ассалому алайкум, ${name}!</b>\nХуш келибсиз.\n\nКеракли бўлимни пастдан танланг.`, {
            parse_mode: 'HTML',
            ...startKeyboard
        });
    });

    bot.hears(REG.register, async (ctx) => {
        ctx.scene.enter('scenesReg');
    });

    bot.hears(REG.about, async (ctx) => {
        ctx.replyWithPhoto(
            { source: fs.createReadStream('./resurs/images/image1.jpg') },
            {
                caption: `<b>Ҳурматли ${escapeHtml(ctx.from.first_name || '')}!</b>\n` +
                    fs.readFileSync('./resurs/text/about.txt', 'utf8').toString(),
                parse_mode: 'HTML'
            }
        );
    });

    bot.hears(REG.cancel, async ctx => {
        ctx.reply('<b>Бош саҳифа</b>', { parse_mode: "HTML", ...startKeyboard });
    });

    return bot;
}

async function main() {
    await db.init();

    const app = express();
    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views'));
    app.use(createPanel());

    await new Promise((resolve) => app.listen(PORT, resolve));
    console.log(`Panel http://localhost:${PORT} portda ishlayapti...`);
    if (!process.env.PANEL_PASSWORD) {
        console.warn("OGOHLANTIRISH: PANEL_PASSWORD berilmagan, veb panel o'chiq (503).");
    }

    if (!BOT_TOKEN) {
        console.warn("OGOHLANTIRISH: BOT_TOKEN berilmagan. Bot ishga tushmadi, faqat veb panel ishlayapti.");
        return;
    }
    const bot = createBot(BOT_TOKEN);
    bot.launch().catch((err) => console.error('Bot xatosi:', err.message));
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
