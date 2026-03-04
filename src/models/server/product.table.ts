import { IndexType, Permission } from "node-appwrite";
import { db, productTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createProductTable(){
    await tablesDB.createTable(db, productTable, productTable, [
       Permission.read("any"),
    ])
    console.log("Product table is created");
    
    await Promise.all([
        tablesDB.createStringColumn(db, productTable, "productName", 1000, true),
        tablesDB.createStringColumn(db, productTable, "slug", 1000, true),
        tablesDB.createStringColumn(db, productTable, "description", 10000, true),
        tablesDB.createStringColumn(db, productTable, "images", 1000, false, undefined, true),
        tablesDB.createStringColumn(db, productTable, "category", 100, true),
        tablesDB.createStringColumn(db, productTable, "subcategory", 100, false),
        tablesDB.createFloatColumn(db, productTable, "price", true,0.00, 10000000.00),
        tablesDB.createFloatColumn(db, productTable, "finalPrice", true,0.00, 10000000.00),
        tablesDB.createIntegerColumn(db, productTable, "stock", true,0, 10000000),
    ])
    console.log("Product column is created");
    
    await Promise.all([
        tablesDB.createIndex(db, productTable, "productName", IndexType.Fulltext, ["productName"],),
        tablesDB.createIndex(db, productTable, "slug", IndexType.Unique, ["slug"],)
    ])
}