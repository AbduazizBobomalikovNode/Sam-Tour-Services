const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DATE_URL || 'mongodb+srv://nodederter:kapalakSAS1D@cluster0.kow1y.mongodb.net/Bots?retryWrites=true&w=majority';
const client = new MongoClient(uri);

const getDate = require("../resurs/function/format");
if (client)
    console.log('DataBesega ulanish hosil qilindi!')

let contacts = null;
let users = null;
let db = null;
class DB {
    constructor() {
        (async function () {
            await client.connect()
            db = client.db('samtour_sevice');

            contacts = await db.collection("contacts")
            if (contacts)
                console.log('contacts jadvaliga ulanish hosil qilindi!');
            users = await db.collection("users")
            if (users)
                console.log('users jadvaliga ulanish hosil qilindi!');
        })();
        this.contacts = contacts;
        this.users = users;
    }
    async addUser(id) {
        try {
            if (!(await users.findOne({ id: id }))) {
                // let date = (new Date()).toLocaleString().slice(0,10).replaceAll(",","");
                await users.insertOne({ id: id, date: getDate() });
            } else {
                await users.updateOne(
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
        if (e == 'count') {
            try {
                return users.countDocuments({});
            } catch (error) {

            }
        }
        var k = [];
        try {
            let list = await users.find({}, { projection: { _id: 0 } }).sort({ date: 1 }).toArray()
            await list.forEach((user) => { k.push(user) });
        } catch (error) {

        }
        return k;
    }

    async getAllChart() {
        var k = [];
        var j = [];
        for (let index = 0; index < 12; index++) {
            const dateString = `${(new Date()).getFullYear()}-${(index + 1) > 9 ? index + 1 : "0" + (index + 1)}`;
            const regex = new RegExp(`.*${dateString}.*`, 'g');
            let list1 = await contacts.countDocuments({ date: regex });
            let list2 = await users.countDocuments({ date: regex });
            k[index] = list1;
            j[index] = list2;
        }
        return [k, j];
    }

    async getContacts(id) {
        try {
            let result = await contacts.findOne({ id: id });
            if (result) {
                return result;
            }
        } catch (error) {
            return false;
        }
    }
    async addContacts(contact) {
        try {
            console.log(contact)
            if (!(await contacts.findOne(contact))) {
                await contacts.insertOne(contact);
                return contact;
            } else {
                return false;
            }
        } catch (error) {

        }
    }
    async getAllContacts(e) {
        if (e == 'count') {
            try {
                return contacts.countDocuments({});
            } catch (error) {

            }

        }
        var k = [];
        try {
            let list = await contacts.find({}, { projection: { _id: 0 } }).sort({ date: 1, time: 1 }).toArray()
            await list.forEach((contact) => { k.push(contact) });
        } catch (error) {

        }
        return k;
    }
    async getAllContactsDate(e) {
        if (e == 'count') {
            try {
                return contacts.countDocuments({ date: getDate() });
            } catch (error) {

            }
        }
        var k = [];
        // let date = (new Date()).toLocaleString().slice(0,10).replaceAll(",","");
        try {
            let list = await contacts.find({ date: getDate() }, { projection: { _id: 0 } }).sort({ date: 1, time: 1 }).toArray()
            await list.forEach((contact) => { k.push(contact) });
        } catch (error) {

        }
        return k;
    }
}

module.exports = new DB();

