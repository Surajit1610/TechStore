import { Permission } from "node-appwrite";
import { db, categoryTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createCategoryTable(){
    await tablesDB.createTable(db, categoryTable, categoryTable, [
       Permission.read("any"),
    ])
    console.log("Category table is created");
    
    await Promise.all([
        tablesDB.createStringColumn(db, categoryTable, "categoryName", 1000, true),
        tablesDB.createStringColumn(db, categoryTable, "categoryImage", 10000, false),
        tablesDB.createStringColumn(db, categoryTable, "subcategory", 10000, false, undefined, true),
    ])
    console.log("Category column is created");
    
}
