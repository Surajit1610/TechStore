import { Permission } from "node-appwrite";
import { db, customerPaymentTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createCustomerPaymentTable(){
    await tablesDB.createTable(db, customerPaymentTable, customerPaymentTable, [
       Permission.read("any"),
    ])
    console.log("Customer payment table is created");
    
    await Promise.all([
        tablesDB.createFloatColumn(db, customerPaymentTable, "amount", true, 0.00),
        tablesDB.createStringColumn(db, customerPaymentTable, "customerId", 1000, true),
        tablesDB.createStringColumn(db, customerPaymentTable, "transactionId", 1000, true),               
    ])
    console.log("Customer payment column is created");
    
}   