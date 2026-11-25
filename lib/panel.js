const path = require('path');
const crypto = require('crypto');
const express = require('express');
const db = require('../db/db');
const getDate = require('../resurs/function/format');
const { formatPhone } = require('./phone');
const { buildContactsXlsx } = require('./xlsx');

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

function digest(value) {
    return crypto.createHash('sha256').update(String(value)).digest();
}

// Vaqt bo'yicha doimiy muddatda taqqoslash
function safeEqual(a, b) {
    return crypto.timingSafeEqual(digest(a), digest(b));
}

function disabledPage(res) {
    res.status(503).type('html').send(
        '<!doctype html><html lang="uz"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        "<title>Panel o'chiq</title></head>" +
        '<body style="font-family:system-ui,sans-serif;max-width:480px;margin:15vh auto;padding:0 16px;color:#1f2937">' +
        "<h1 style=\"font-size:20px\">Boshqaruv paneli o'chirilgan</h1>" +
        "<p>Panelni yoqish uchun serverda <code>PANEL_PASSWORD</code> o'zgaruvchisini belgilang.</p>" +
        '</body></html>');
}

// PANEL_PASSWORD berilmagan bo'lsa hech qachon ma'lumot bermaydi (503).
function auth(req, res, next) {
    const password = process.env.PANEL_PASSWORD;
    if (!password) return disabledPage(res);
    const user = process.env.PANEL_USER || 'admin';
    const header = req.headers.authorization || '';
    if (header.startsWith('Basic ')) {
        const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
        const i = decoded.indexOf(':');
        if (i >= 0) {
            const okUser = safeEqual(decoded.slice(0, i), user);
            const okPass = safeEqual(decoded.slice(i + 1), password);
            if (okUser && okPass) return next();
        }
    }
    res.set('WWW-Authenticate', 'Basic realm="Sam Tour Services", charset="UTF-8"');
    return res.status(401).type('text').send('Kirish uchun login va parol kerak.');
}

// Kelajakdagi oylar grafikda 0 ga tushmasligi uchun null qilinadi
function untilNow(list) {
    const current = new Date().getMonth();
    return list.map((v, i) => (i > current ? null : v));
}

function asyncRoute(fn) {
    return (req, res, next) => fn(req, res, next).catch(next);
}

function createPanel() {
    const router = express.Router();
    router.use(auth);

    router.use('/vendor/chart', express.static(path.dirname(require.resolve('chart.js/dist/chart.min.js'))));
    router.get('/logo.jpg', (req, res) => res.sendFile(path.join(__dirname, '../resurs/images/image1.jpg')));
    router.get('/panel.css', (req, res) => res.sendFile(path.join(__dirname, '../resurs/asserts/panel.css')));

    router.get('/', asyncRoute(async (req, res) => {
        const today = getDate();
        const [contacts, users] = await Promise.all([db.getAllContacts(), db.getAllUsers('count')]);
        const [byContacts, byUsers] = await db.getAllChart();
        const rows = contacts.slice().reverse().map((c) => ({
            name: c.name || '',
            phone: formatPhone(c.phone),
            username: c.username ? '@' + c.username : '',
            date: c.date || '',
            time: c.time || '',
            note: c.addition || '',
            today: c.date === today,
        }));
        res.render('index', {
            year: new Date().getFullYear(),
            today,
            usersCount: users,
            totalCount: contacts.length,
            todayCount: rows.filter((r) => r.today).length,
            months: MONTHS,
            byContacts: untilNow(byContacts),
            byUsers: untilNow(byUsers),
            rows,
        });
    }));

    router.get('/api/stats', asyncRoute(async (req, res) => {
        const [contacts, users] = await db.getAllChart();
        res.json({ year: new Date().getFullYear(), months: MONTHS, contacts, users });
    }));

    router.get('/export.xlsx', asyncRoute(async (req, res) => {
        const scope = req.query.scope === 'today' ? 'today' : 'all';
        const contacts = scope === 'today' ? await db.getAllContactsDate() : await db.getAllContacts();
        const buffer = await buildContactsXlsx(contacts);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="kontaktlar-${scope}-${getDate()}.xlsx"`,
            'Cache-Control': 'no-store',
        });
        res.send(buffer);
    }));

    router.use((err, req, res, next) => {
        console.error('Panel xatosi:', err.message);
        res.status(500).type('text').send("Ichki xatolik. Keyinroq qayta urinib ko'ring.");
    });
    return router;
}

module.exports = { createPanel, auth, safeEqual };
