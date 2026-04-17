import { Permission } from "node-appwrite";
import { db, featuredProductTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createFeaturedProductTable(){
    await tablesDB.createTable(db, featuredProductTable, featuredProductTable, [
       Permission.read("any"),
    ])
    console.log("Featured product table is created");
    
    await Promise.all([
        tablesDB.createStringColumn(db, featuredProductTable, "title", 100, true),
        tablesDB.createStringColumn(db, featuredProductTable, "productIds", 100, false, undefined, true),
    ])
    console.log("Featured product column is created");
    
}
