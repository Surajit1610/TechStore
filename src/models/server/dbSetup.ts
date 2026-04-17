import { db } from "../name";
import { tablesDB } from "../server/config";
import createAddressTable from "./address.table";
import createCategoryTable from "./category.table";
import createCustomerTable from "./customer.table";
import createCustomerPaymentTable from "./customer_payment.table";
import createFeaturedProductTable from "./featured_product.table";
import createItemTable from "./item.table";
import createNotificationTable from "./notification.table";
import createOnlineOrderTable from "./online_orders.table";
import createProductTable from "./product.table";
import createSliderTable from "./slider.table";
import createSubcategoryTable from "./subcategory.table";
import createSupportMessageTable from "./support_message.table";

export default async function getOrCreateDB(){
    try {
        await tablesDB.get(db);
        console.log("Database connection");
    } catch (error) {
        try {
            await tablesDB.create(db, db)
            console.log("Database created");

            await Promise.all([
                createAddressTable(),
                createCategoryTable(),
                createCustomerTable(),
                createCustomerPaymentTable(),
                createFeaturedProductTable(),
                createItemTable(),
                createNotificationTable(),
                createOnlineOrderTable(),
                createProductTable(),
                createSliderTable(),
                createSubcategoryTable(),
                createSupportMessageTable(),
            ])

            console.log("Table created");
            console.log("Database connected");
            
        } catch (error) {
            console.log("error creating database or table", error);
            
        }
    }
}
