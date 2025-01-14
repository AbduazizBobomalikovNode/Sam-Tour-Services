const { Telegraf, Markup, session, Scenes } = require("telegraf");
const fs = require('fs');
const express = require('express');
const app = express();


app.set('view engine', 'pug');
app.set('views', './views'); 
app.use('/table',express.static('resurs/asserts'));


const reg = require('./router/reg');
const admin = require('./router/admin');
const db = require("./db/db");
const startKeyboard = Markup.keyboard([['📝Руйхатдан утиш', '👨🏻‍💻Биз ҳақимизда']]).resize()

const BOT_TOKEN = "6863125448:AAHZYNcBP04ZTI3BciWkD6p3Z1FleU_HioQ";

const bot = new Telegraf(BOT_TOKEN);

bot.use(Telegraf.log());
bot.use(session());
const stage = new Scenes.Stage([reg, admin]);
bot.use(stage.middleware())
bot.use((ctx, next) => {
    ctx.session = ctx.session ? ctx.session : {};
    return next();
});
bot.use((ctx, next) => {
    let chat = { id: -1001616284248, type: "supergroup" };
    if (ctx.chat.id == chat.id && ctx.chat.type == chat.type) {
        console.log(ctx.chat);
        ctx.scene.enter('scenesAdmin');
        return ctx;
    }
    return next();
});

bot.start(async (ctx) => {
    db.addUser(ctx.from.id);
    let name = ctx.message.chat.first_name;
    ctx.reply("Aссалому алайкум. Xуш келибсиз " + name, {
        parse_mode: 'HTML',
        ...Markup.keyboard(
            [['📝Руйхатдан утиш', '👨🏻‍💻Биз ҳақимизда']]).resize()
    });
});

bot.hears('📝Руйхатдан утиш', async (ctx) => {
    ctx.scene.enter('scenesReg');
});

bot.hears('👨🏻‍💻Биз ҳақимизда', async (ctx) => {
    ctx.replyWithPhoto(
        { source: fs.createReadStream('./resurs/images/image1.jpg') },
        {
            caption: `<b>Ҳурматли  ${ctx.from.first_name}!</b>\n` +
                fs.readFileSync('./resurs/text/about.txt', 'utf8').toString(),
            parse_mode: 'HTML'
        }
    );
});
bot.hears('↩️бекор қилиш', async ctx => {
    ctx.reply('Бош саҳифа', { parse_mode: "HTML", ...startKeyboard });
});

bot.on("text", async (ctx) => {
    ctx.reply(`reply : ${ctx.message.text}`);
});

app.get('/', (req, res) => {
    res.render('index');
});
app.listen(8080, () => {
    console.log(`Server http://localhost:${8080} portda ishlayapti...`);
    bot.launch();
});
  
