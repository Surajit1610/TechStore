import { Permission, Role } from "node-appwrite";
import { db, addressTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createAddressTable(){
    await tablesDB.createTable(db, addressTable, addressTable, [
       Permission.read(Role.users()),
       Permission.create(Role.users()),
       Permission.update(Role.users()),
       Permission.delete(Role.users()),
    ], true)
    console.log("Address table is created");

    await Promise.all([
        tablesDB.createStringColumn(db, addressTable, "customerId", 100, true),
        tablesDB.createStringColumn(db, addressTable, "location", 1000, true),
        tablesDB.createStringColumn(db, addressTable, "city", 100, true),
        tablesDB.createStringColumn(db, addressTable, "state", 100, true),
        tablesDB.createStringColumn(db, addressTable, "pincode", 20, true),
        tablesDB.createStringColumn(db, addressTable, "phone", 50, true),
    ])
    console.log("Address column is created");
}   