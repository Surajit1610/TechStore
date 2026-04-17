import { Permission, Role } from "node-appwrite";
import { db, onlineOrderTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createOnlineOrderTable() {
    await tablesDB.createTable(db, onlineOrderTable, onlineOrderTable, [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
    ], true);
    console.log("Online order table is created");
    
    await Promise.all([
        tablesDB.createStringColumn(db, onlineOrderTable, "customerId", 100, true),
        tablesDB.createStringColumn(db, onlineOrderTable, "address", 10000, true),
        tablesDB.createStringColumn(db, onlineOrderTable, "itemId", 1000, true, undefined, true),
        tablesDB.createFloatColumn(db, onlineOrderTable, "totalAmount", true, 0.00),
        tablesDB.createFloatColumn(db, onlineOrderTable, "shipping_charge", true, 0.00),
        tablesDB.createStringColumn(db, onlineOrderTable, "paymentId", 100, false),
        tablesDB.createEnumColumn(db, onlineOrderTable, "paymentStatus", ["paid", "unpaid"], true, undefined),
        tablesDB.createEnumColumn(db, onlineOrderTable, "paymentType", ["cod", "upi", "card", "netbanking"], true, undefined),
        tablesDB.createEnumColumn(db, onlineOrderTable, "status", ["placed", "processing", "shipped", "delivered", "cancelled by customer", "cancelled by seller", "refunded"], true, undefined),
        tablesDB.createStringColumn(db, onlineOrderTable, "shiprocketOrderId", 100, false),
        
    ]);
    console.log("Online order column is created");
    
}