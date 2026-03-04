import { Permission, Role } from "node-appwrite";
import { db, customerTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createCustomerTable(){
    await tablesDB.createTable(db, customerTable, customerTable, [
       Permission.read("any"),
       Permission.read(Role.label("customer")),
       Permission.create(Role.label("customer")),
       Permission.update(Role.label("customer")),
       Permission.delete(Role.label("customer")),
       Permission.create("any"),
    ])
    console.log("Customer table is created");
    
    await Promise.all([
        tablesDB.createStringColumn(db, customerTable, "avatar", 1000, true),
        tablesDB.createStringColumn(db, customerTable, "name", 100, true),
        tablesDB.createStringColumn(db, customerTable, "email", 100, true),
        tablesDB.createStringColumn(db, customerTable, "phone", 100, false),
        tablesDB.createStringColumn(db, customerTable, "likedProducts", 1000, false, undefined, true),
        tablesDB.createStringColumn(db, customerTable, "cartId", 1000, false, undefined, true),
        tablesDB.createStringColumn(db, customerTable, "orderHistory", 1000, false, undefined, true),
        tablesDB.createStringColumn(db, customerTable, "paymentHistory", 1000, false, undefined, true),
        tablesDB.createStringColumn(db, customerTable, "notificationHistory", 1000, false, undefined, true),
        tablesDB.createBooleanColumn(db, customerTable, "hasUnreadNotification", false, false),

    ])
    console.log("Customer column is created");
    
}