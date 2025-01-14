const { Scenes, Markup } = require('telegraf');
const { button } = Markup;
const db = require("../db/db");
const scenesReg = new Scenes.BaseScene('scenesReg');

const getDate = require("../resurs/function/format");
const startKeyboard = Markup.keyboard([['📝Руйхатдан утиш', '👨🏻‍💻Биз ҳақимизда']]).resize()

let flag = { wait_contact: false, wait_name: false, wait_addition: false };

scenesReg.enter(async (ctx) => {
    ctx.reply("Рўйхатдан ўтиш учун аввал телефон рақамингизни киритинг.\n\n"+
    "Масалан: +998 90 730 30 30 \n\n"+
    "Ёки пасдаги тугма ( ☎️ Телефон рақамни улашиш) орқали рақамингизни улашинг"
        , {
            parse_mode: 'HTML',
            ...Markup.keyboard([[button.contactRequest("☎️Телефон рақамни улашиш")], ['↩️бекор қилиш']]).resize()
        }).catch((err)=>{
            console.log(err);
        });
    flag.wait_contact = true;
});


scenesReg.hears('🔚Якунлаш', async ctx => {
    let date = getDate();
    let time = (new Date()).toLocaleString().slice(11,20).trim();
    db.addContacts({...ctx.session.user,date:date,time:time,username:ctx.chat.username,id:ctx.chat.id});
    postGroup(ctx);
    await ctx.reply("Сиз муфақиятли рўйхатдан ўтингиз!", { parse_mode: "HTML", ...startKeyboard }).catch((err)=>{
        console.log(err);
    });
    ctx.scene.leave();
});
scenesReg.hears('↩️бекор қилиш', async ctx => {
    ctx.reply('Бош саҳифа', { parse_mode: "HTML", ...startKeyboard }).catch((err)=>{
        console.log(err);
    });
    ctx.scene.leave();
});

scenesReg.on('message', async ctx => {
    if (ctx.message.contact || ctx.message.text) {
        if (flag.wait_contact) {
            let tel = ctx.message.contact ? ctx.message.contact.phone_number : ctx.message.text;
            tel = tel.startsWith("+")?tel:"+"+tel;
            if (tel.startsWith("+998")) {
                tel = is_numeric(tel.slice(4, tel.length));
                tel = tel.replaceAll(" ","").trim();
                if (tel.length == 9) {
                    flag.wait_contact = false;
                    flag.wait_name = true;
                    ctx.session.user = { id: ctx.from.id, phone: tel };
                    return ctx.reply("Раҳмат энди  исмингизни киритинг!", {
                        parse_mode: "HTML",
                        ...Markup.keyboard([['↩️бекор қилиш']]).resize()
                    }).catch((err)=>{
                        console.log(err);
                    });;
                }
            }
            ctx.reply("ушбу рақам яроқсиз!").catch((err)=>{
                console.log(err);
            });;
        }
    }
    if (ctx.message.text && flag.wait_name) {
        let name = ctx.message.text;
        // console.log(name,is_numeric(name));
        if (is_numeric(name).length <= 2) {
            ctx.reply(`${name}  Малумотларининг ало даражада қабул қилинди!` +
                "\nСиз яна қўшимча малумот киритишингиз мумкин:" +
                "\nАгар саволингиз ёки мақсадингиз ҳақида малумот бермоқчи бўлсангиз." +
                "\nАгар ҳаммаси яхши бўлса (🔚Якунлаш) тугмасини босинг.", {
                parse_mode: "HTML",
                ...Markup.keyboard([['🔚Якунлаш'], ['↩️бекор қилиш']]).resize()
            }).catch((err)=>{
                console.log(err);
            });;
            flag.wait_name = false;
            flag.wait_addition = true;
            ctx.session.user.name = name;
            return;
        }
    }
    if (ctx.message.text && flag.wait_addition) {
        let addition = ctx.message.text;
        if (addition.length <= 150) {
            ctx.session.user.addition = addition;
            let date = getDate();
            let time = (new Date()).toLocaleString().slice(11,20).trim();
            db.addContacts({...ctx.session.user,date:date,time:time,username:ctx.chat.username,id:ctx.chat.id});
            ctx.reply("Сиз муфақиятли рўйхатдан ўтингиз!", { parse_mode: "HTML", ...startKeyboard }).catch((err)=>{
                console.log(err);
            });;
            postGroup(ctx);
            ctx.scene.leave();
        } else {
            ctx.reply("қўшимча малумот белгилари сони 150 тадан ошмаслиги керак!").catch((err)=>{
                console.log(err);
            });;
        }
    }
});

async function postGroup(ctx){
    let message = `#${ctx.from.id}  yangi kontakt.`+
    `\nIsmi: ${ctx.session.user.name}`+
    `\nTelefon raqami: +998${ctx.session.user.phone}`+
    `\nQo'shimcha: ${ctx.session.user.addition || "Mavjut emas"}`+
    `\nTelegram: ${ctx.from.username?"@":""}${ctx.from.username || "Mavjut emas"}`+
    `\nSana va vaqt: ${(new Date()).toLocaleString().slice(0,-2).trim()}`;
    ctx.telegram.sendMessage(-1001616284248,message).catch((err)=>{
        console.log(err);
    });
}
function is_numeric(str) {
    return str.split('').map((value) => { if (typeof parseInt(value) === "number" && !isNaN(value)) { return value } return '' }).join('')
}

module.exports = scenesReg;