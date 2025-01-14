const { Scenes, Markup } = require('telegraf');
const ExcelJS = require('exceljs');
const path = require('path');
// const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
// const fs = require('fs');
const { button } = Markup;
const db = require("../db/db");
const workbook = new ExcelJS.Workbook();
const scenesAdmin = new Scenes.BaseScene('scenesAdmin');

const startKeyboard = Markup.keyboard(
    [
        ['🗒Bugungi kontaktlar', '📑Barcha kontaktlar'],
        ['📊Bot statistikasi', '📣Botga reklama joylash']
    ]).resize()
const oylar = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];


let flag = { wait_advertising: false };

scenesAdmin.enter(async (ctx) => {
    if (ctx.message) {
        if (ctx.message.caption && ctx.message.caption.split('')[0] == '#') {
            console.log(ctx.message);
            return postGroupToUser(ctx, 'adminMessegeCaption');
        }

        let command = ctx.message.text;
        if (command == '🗒Bugungi kontaktlar') {
            return allContactsDate(ctx);
        } else
            if (command == '📑Barcha kontaktlar') {
                return allContacts(ctx);
            } else
                if (command == '📊Bot statistikasi') {
                    return botStatistics(ctx);
                } else
                    if (command == '📣Botga reklama joylash') {
                        return botAdvertising(ctx);
                    } else if (ctx.message.reply_to_message) {
                        postGroupToUser(ctx);
                    } else
                        ctx.reply('Bosh sahifa', { parse_mode: "HTML", ...startKeyboard.resize() });
    }
});

scenesAdmin.hears('📑Barcha kontaktlar', async ctx => {
    allContacts(ctx);
});

scenesAdmin.hears('🗒Bugungi kontaktlar', async ctx => {
    allContactsDate(ctx);
});

scenesAdmin.hears('📊Bot statistikasi', async (ctx) => {
    botStatistics(ctx);
})

scenesAdmin.hears('📣Botga reklama joylash', async (ctx) => {
    botAdvertising(ctx);
})
scenesAdmin.hears('↩️bekor qilish', async ctx => {
    ctx.reply('Bosh sahifa', { parse_mode: "HTML", ...startKeyboard });
    flag.wait_advertising = false;
    // ctx.scene.leave();
});

scenesAdmin.on("message", async (ctx) => {
    if (flag.wait_advertising) {
        let users = await db.getAllUsers();
        users.forEach((chat) => {
            ctx.copyMessage(chat.id).catch((err)=>{
                console.log(typeof err,err.response);
                
            });
        });
        flag.wait_advertising = false;
        ctx.reply("status: Yuborilmoqda... \nfoydalanuvchilar soni: " + users.length + " ta", startKeyboard);
        return;
    }
    if (ctx.message.caption && ctx.message.caption.split('')[0] == '#') {
        return postGroupToUser(ctx, 'adminMessegeCaption');
    }
    if (ctx.message.text && ctx.message.text.split('')[0] == '#') { return postGroupToUser(ctx, 'adminMessege') }
    if (ctx.message.reply_to_message) { return postGroupToUser(ctx) };
    ctx.reply("qayta ishlab bo'lmadi", startKeyboard).catch((err)=>{
        console.log(err);
    });
});



async function allContacts(ctx) {
    const templatePath = path.join(__dirname, '../resurs/documents/template.xlsx');
    workbook.xlsx.readFile(templatePath)
        .then(async () => {
            let contacts = await db.getAllContacts();
            // Access the worksheet you want to modify (assuming the first sheet in this case)
            const worksheet = workbook.getWorksheet(1);
            for (let index = 0; index < contacts.length; index++) {
                const element = contacts[index];
                worksheet.getCell(`A${index + 3}`).value = index + 1;
                worksheet.getCell(`B${index + 3}`).value = element.name || "";
                worksheet.getCell(`C${index + 3}`).value = element.phone || "";
                worksheet.getCell(`D${index + 3}`).value = "@" + element.username || "";
                worksheet.getCell(`E${index + 3}`).value = element.id || "";
                worksheet.getCell(`F${index + 3}`).value = element.date || "";
                worksheet.getCell(`G${index + 3}`).value = element.time || "";
                worksheet.getCell(`H${index + 3}`).value = element.addition || "mavjut emas";
            }
            const outputPath = path.join(__dirname, '../resurs/documents/result.xlsx');
            return workbook.xlsx.writeFile(outputPath);
        })
        .then(() => {
            console.log('Excel fayli o\'zgartirildi va muvaffaqiyatli saqlandi!');
            ctx.replyWithDocument({ source: path.join(__dirname, 'result.xlsx') }, { caption: '📑Barcha kontaktlar.' });
        })
        .catch((error) => {
            ctx.reply("Xatolik yuzaga keldi: Boshqatdan urinib koring.")
            console.error('Error:', error.message);
        });
}
async function allContactsDate(ctx) {
    const templatePath = path.join(__dirname, '../resurs/documents/template.xlsx');
    workbook.xlsx.readFile(templatePath)
        .then(async () => {
            let contacts = await db.getAllContactsDate();
            // Access the worksheet you want to modify (assuming the first sheet in this case)
            const worksheet = workbook.getWorksheet(1);
            for (let index = 0; index < contacts.length; index++) {
                const element = contacts[index];
                worksheet.getCell(`A${index + 3}`).value = index + 1;
                worksheet.getCell(`B${index + 3}`).value = element.name || "";
                worksheet.getCell(`C${index + 3}`).value = element.phone || "";
                worksheet.getCell(`D${index + 3}`).value = "@" + element.username || "";
                worksheet.getCell(`E${index + 3}`).value = element.id || "";
                worksheet.getCell(`F${index + 3}`).value = element.date || "";
                worksheet.getCell(`G${index + 3}`).value = element.time || "";
                worksheet.getCell(`H${index + 3}`).value = element.addition || "mavjut emas";
            }
            const outputPath = path.join(__dirname, '../resurs/documents/result.xlsx');
            return workbook.xlsx.writeFile(outputPath);
        })
        .then(() => {
            console.log('Excel fayli o\'zgartirildi va muvaffaqiyatli saqlandi!');
            ctx.replyWithDocument({ source: path.join(__dirname, '../resurs/documents/result.xlsx') }, { caption: '🗒Bugungi kontaktlar.' });
        })
        .catch((error) => {
            ctx.reply("Xatolik yuzaga keldi: Boshqatdan urinib koring.")
            console.error('Error:', error.message);
        });
}
async function allContactsDate(ctx) {
    const templatePath = path.join(__dirname, '../resurs/documents/template.xlsx');
    workbook.xlsx.readFile(templatePath)
        .then(async () => {
            let contacts = await db.getAllContactsDate();
            // Access the worksheet you want to modify (assuming the first sheet in this case)
            const worksheet = workbook.getWorksheet(1);
            for (let index = 0; index < contacts.length; index++) {
                const element = contacts[index];
                worksheet.getCell(`A${index + 3}`).value = index + 1;
                worksheet.getCell(`B${index + 3}`).value = element.name || "";
                worksheet.getCell(`C${index + 3}`).value = element.phone || "";
                worksheet.getCell(`D${index + 3}`).value = "@" + element.username || "";
                worksheet.getCell(`E${index + 3}`).value = element.id || "";
                worksheet.getCell(`F${index + 3}`).value = element.date || "";
                worksheet.getCell(`G${index + 3}`).value = element.time || "";
                worksheet.getCell(`H${index + 3}`).value = element.addition || "mavjut emas";
            }
            const outputPath = path.join(__dirname, '../resurs/documents/result.xlsx');
            return workbook.xlsx.writeFile(outputPath);
        })
        .then(() => {
            console.log('Excel fayli o\'zgartirildi va muvaffaqiyatli saqlandi!');
            ctx.replyWithDocument({ source: path.join(__dirname, '../resurs/documents/result.xlsx') }, { caption: '🗒Bugungi kontaktlar.' });
        })
        .catch((error) => {
            ctx.reply("Xatolik yuzaga keldi: Boshqatdan urinib koring.")
            console.error('Error:', error.message);
        });
}
async function botStatistics(ctx) {
    ctx.reply("bot statistikasi tayorlanmoqda...");
    let users = await db.getAllUsers('count');
    let contactsDate = await db.getAllContactsDate('count');
    let contacts = await db.getAllContacts('count');
    // const width = 800;
    // const height = 400;
    // const canvas = new ChartJSNodeCanvas({ width, height });
    // const result = await db.getAllChart();
    // userData = result[0];
    // commentData = result[1];
    // const chartConfig = {
    //     type: 'line',
    //     data: {
    //         labels: oylar,
    //         datasets: [
    //             {
    //                 label: 'Foydalanuvchilar soni',
    //                 borderColor: 'rgba(75, 192, 192, 1)',
    //                 data: result[0],
    //             },
    //             {
    //                 label: 'Kontaktlar soni',
    //                 borderColor: 'rgba(255, 99, 132, 1)',
    //                 data: result[1],
    //             },
    //         ],
    //     },
    // };
    // const imageBuffer = await canvas.renderToBuffer(chartConfig);
    let message = `Samtour Sevice botning malumotlari(@samtour_sevice_bot).` +
        `\n📎Bot foydalanuvchilari soni:  <b>${users}</b>👥  ta` +
        `\n📎Bugun ro'yxatga olinga kontaktlar:   <b>${contactsDate}</b>📑 ta` +
        `\n📎Barcha ro'yxatga olinga kontaktlar:  <b>${contacts}</b>📑 ta`;
    // ctx.replyWithPhoto(imageBuffer, { parse_mode: "HTML", caption: message, ...startKeyboard });
    ctx.telegram.sendMessage(-1001616284248,message,{parse_mode:'HTML',...startKeyboard});
    // ctx.telegram.sendMessage(-1001616284248,message);//{source:imageBuffer},{parse_mode:'HTML',caption:message,...startKeyboard})
}
async function botAdvertising(ctx) {
    ctx.reply("Barcha turdagi  reklamani  ushbu chatga tashlang va ular bot foydalanuvchilariga cho'natiladi!"
        , { parse_mode: 'HTML', ...Markup.keyboard(['↩️bekor qilish']).resize() });
    flag.wait_advertising = true;
}
async function postGroupToUser(ctx, block) {
    try {
        let user = null;
        if (block == 'adminMessege') {
            user = ctx.message.text.split(' ')[0].slice(1);
        } else if (block == 'adminMessegeCaption') {
            user = ctx.message.caption.split(' ')[0].slice(1);
        } else user = ctx.message.reply_to_message.text.split(' ')[0].slice(1);
        console.log(await ctx.telegram.getChat(user).catch((err) => { return false }));
        if (await ctx.telegram.getChat(user).catch((err) => { return false })) {
            ctx.reply(`${user} ushbu foydalanuvchiga xabar jo'natildi!`).catch((err)=>{
                console.log(err);
            });
            ctx.telegram.sendMessage(user, "Samtour Sevice Adminlaridan xabar:").catch((err)=>{
                console.log(err);
            });
            ctx.copyMessage(user).catch((err)=>{
                console.log(err);
            });
        }
    } catch (error) {
        console.log(error);
    }
    // console.log(,ctx.message.reply_to_message.text.split(' ')[0],)
}
module.exports = scenesAdmin;

// {
//     ok: false,
//     error_code: 403,
//     description: 'Forbidden: bot was blocked by the user'
//   }