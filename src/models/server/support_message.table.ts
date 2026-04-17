import { Permission, Role } from "node-appwrite";
import { db, supportMessageTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createSupportMessageTable() {
    await tablesDB.createTable(db, supportMessageTable, supportMessageTable, [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ], true)
    console.log("Support message table is created");

    await Promise.all([
        tablesDB.createStringColumn(db, supportMessageTable, "name", 100, true),
        tablesDB.createStringColumn(db, supportMessageTable, "email", 100, true),
        tablesDB.createStringColumn(db, supportMessageTable, "phone", 20, false),
        tablesDB.createStringColumn(db, supportMessageTable, "subject", 150, true),
        tablesDB.createStringColumn(db, supportMessageTable, "message", 5000, true),
        tablesDB.createStringColumn(db, supportMessageTable, "status", 20, true, "Open"), // e.g. Open, Closed
        tablesDB.createDatetimeColumn(db, supportMessageTable, "createdAt", true),
    ])
    console.log("Support message columns are created");
}
