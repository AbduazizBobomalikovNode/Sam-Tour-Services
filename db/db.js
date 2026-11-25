const { MongoClient } = require('mongodb');
const getDate = require("../resurs/function/format");

class DB {
    constructor() {
        this.client = null;
        this.contacts = null;
        this.users = null;
        this.ready = null;
    }

    // Bazaga ulanadi. Qayta chaqirilsa o'sha promise qaytadi.
    init() {
        if (this.ready) return this.ready;
        const uri = process.env.DATE_URL;
        if (!uri) throw new Error("DATE_URL environment o'zgaruvchisi berilmagan");
        this.client = new MongoClient(uri);
        this.ready = this.client.connect().then(() => {
            const db = this.client.db('samtour_sevice');
            this.contacts = db.collection('contacts');
            this.users = db.collection('users');
            console.log("Ma'lumotlar bazasiga ulandi.");
        });
        return this.ready;
    }

    async addUser(id) {
        try {
            await this.ready;
            if (!(await this.users.findOne({ id: id }))) {
                await this.users.insertOne({ id: id, date: getDate() });
            } else {
                await this.users.updateOne(
                    { id: id }, {
                    $set: { id: id },
                    $currentDate: { lastModified: true }
                })
            }
        } catch (error) {
            console.log(error);
        }
    }

    async getAllUsers(e) {
        await this.ready;
        if (e == 'count') {
            return this.users.countDocuments({});
        }
        return this.users.find({}, { projection: { _id: 0 } }).sort({ date: 1 }).toArray();
    }

    // [oylar bo'yicha kontaktlar, oylar bo'yicha foydalanuvchilar] (joriy yil, 12 ta son)
    async getAllChart() {
        await this.ready;
        const year = (new Date()).getFullYear();
        const k = [];
        const j = [];
        for (let index = 0; index < 12; index++) {
            const prefix = `${year}-${String(index + 1).padStart(2, '0')}`;
            const regex = new RegExp(`^${prefix}`);
            k[index] = await this.contacts.countDocuments({ date: regex });
            j[index] = await this.users.countDocuments({ date: regex });
        }
        return [k, j];
    }

    async getContacts(id) {
        try {
            await this.ready;
            return (await this.contacts.findOne({ id: id })) || false;
        } catch (error) {
            return false;
        }
    }

    async addContacts(contact) {
        try {
            await this.ready;
            if (!(await this.contacts.findOne(contact))) {
                await this.contacts.insertOne({ ...contact });
                return contact;
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getAllContacts(e) {
        await this.ready;
        if (e == 'count') {
            return this.contacts.countDocuments({});
        }
        return this.contacts.find({}, { projection: { _id: 0 } }).sort({ date: 1, time: 1 }).toArray();
    }

    async getAllContactsDate(e) {
        await this.ready;
        if (e == 'count') {
            return this.contacts.countDocuments({ date: getDate() });
        }
        return this.contacts.find({ date: getDate() }, { projection: { _id: 0 } }).sort({ date: 1, time: 1 }).toArray();
    }
}

module.exports = new DB();
