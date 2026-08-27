# Sam Tour Services

Turistik xizmatlar uchun Telegram bot — ma'lumot beradi, buyurtma qabul qiladi va hisobotni o'zi tayyorlaydi.

---

**Sahifa:** [abduazizbobomalikovnode.github.io/Sam-Tour-Services/](https://abduazizbobomalikovnode.github.io/Sam-Tour-Services/)

## Muammo

Turistik agentlikda bir xil savollar kuniga o'nlab marta takrorlanadi: qanday yo'nalishlar bor, narxi qancha, nima kiradi. Har biriga telefon orqali javob beriladi.

Kechqurun va dam olish kunlarida esa hech kim javob bermaydi — mijoz kutadi yoki boshqa agentlikka murojaat qiladi.

Oy oxirida yana bir ish boshlanadi: qancha buyurtma bo'lgani, qaysi yo'nalish ko'proq sotilgani haqidagi hisobotni kimdir qo'lda yig'adi.

## Nima qiladi

- **Xizmatlarni ko'rsatadi** — yo'nalishlar, narxlar va tafsilotlar bot ichida
- **Buyurtma qabul qiladi** — so'rov bazaga tushadi, yo'qolmaydi
- **Grafik chizadi** — qaysi yo'nalish qancha so'ralgani
- **Excel hisobot beradi** — ochib ishlatiladigan tayyor fayl
- **Web panel** — admin uchun alohida ko'rinish

## Qanday ishlaydi

```
Mijoz  ──bot──►  yo'nalish va narxni ko'radi
                       └─► buyurtma qoldiradi
                             └─► MongoDB
                                   ├─► grafik    (Chart.js → rasm)
                                   └─► Excel     (ExcelJS)
```

Grafik server tomonida chiziladi: `chartjs-node-canvas` rasm yasaydi va uni to'g'ridan-to'g'ri chatga yuborish mumkin — mijoz hech narsa ochmaydi.

## O'rnatish

```bash
git clone https://github.com/AbduazizBobomalikovNode/Sam-Tour-Services.git
cd Sam-Tour-Services
npm install

cp .env.example .env
npm start
```

Kerak bo'ladi: Node.js 16+ va MongoDB.

## Environment

| O'zgaruvchi | Nima uchun |
|---|---|
| `BOT_TOKEN` | [@BotFather](https://t.me/BotFather) bergan token |
| `DATE_URL` | MongoDB ulanish satri |

## Tuzilma

```
index.js      server
bot.js        bot mantiqi
router/       web panel marshrutlari
views/        Pug shablonlari
db/           MongoDB ulanishi
resurs/       yordamchi funksiyalar
docs/         landing sahifa
```

## Texnologiyalar

Node.js · Telegraf · Express · MongoDB · Pug · Chart.js · ExcelJS
