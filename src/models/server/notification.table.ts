import { Permission, Role } from "node-appwrite";
import { db, notificationTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createNotificationTable(){
    await tablesDB.createTable(db, notificationTable, notificationTable, [
       Permission.read(Role.users()),
       Permission.delete(Role.users()),
       Permission.update(Role.users()),
    ], true)
    console.log("Notification table is created");
    
    await Promise.all([
        tablesDB.createStringColumn(db, notificationTable, "notification", 10000, true),
        tablesDB.createStringColumn(db, notificationTable, "userId", 100, true),
    ])
    console.log("Notification column is created");
    
}