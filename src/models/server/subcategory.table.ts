import { Permission } from "node-appwrite";
import { db, subcategoryTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createSubcategoryTable():
    Promise<void>
{
    await tablesDB.createTable(db, subcategoryTable, subcategoryTable, [
       Permission.read("any"),
    ])
    console.log("Subcategory table is created");
    
    await Promise.all([
        tablesDB.createStringColumn(db, subcategoryTable, "subcategoryName", 100, true),
        tablesDB.createStringColumn(db, subcategoryTable, "subcategoryImage", 1000, false),
    ])
    console.log("Subcategory column is created");
    
}