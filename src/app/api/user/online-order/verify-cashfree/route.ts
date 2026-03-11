import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { db, customerTable, onlineOrderTable, customerPaymentTable, itemTable, productTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { ID } from "node-appwrite";

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET_KEY
);

export async function POST(request: NextRequest) {
    try {
        const { orderId, customerId, addressID, itemId, shipping_charge, isDirect } = await request.json();

        // Calculate expected total amount server-side
        const customer = await tablesDB.getRow(db, customerTable, customerId);
        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 400 });
        }

        const itemsToCalculate = isDirect ? itemId : customer.cartId;

        if (!itemsToCalculate || itemsToCalculate.length === 0) {
            return NextResponse.json({ error: "No items to checkout" }, { status: 400 });
        }

        let expectedTotalAmount = 0;
        for (const id of itemsToCalculate) {
            try {
                const item = await tablesDB.getRow(db, itemTable, id);
                if (item && item.productId) {
                    const product = await tablesDB.getRow(db, productTable, item.productId);
                    if (product && typeof product.finalPrice === 'number') {
                        expectedTotalAmount += product.finalPrice * item.quantity;
                    }
                }
            } catch (err) {
                console.error(`Error fetching item/product details for item ID ${id}:`, err);
            }
        }

        // Verify order from Cashfree
        const response = await cashfree.PGOrderFetchPayments(orderId);
        
        const payments = response.data;
        const successfulPayment = payments.find((p: any) => p.payment_status === "SUCCESS");

        if (!successfulPayment) {
            return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
        }

        const actualPaidAmount = successfulPayment.payment_amount || 0;

        // Verify that the user paid the correct amount
        if (actualPaidAmount < expectedTotalAmount) {
            console.error(`Payment amount mismatch. Expected: ${expectedTotalAmount}, Paid: ${actualPaidAmount}`);
            return NextResponse.json({ error: "Partial payment received or amount mismatch" }, { status: 400 });
        }

        const paymentGroup = successfulPayment.payment_group;
        let paymentTypeStr = "card";
        if (paymentGroup === "upi") paymentTypeStr = "upi";
        else if (paymentGroup === "net_banking") paymentTypeStr = "netbanking";

        // Create the order in DB
        const onlineOrder = await tablesDB.createRow(db, onlineOrderTable, ID.unique(), {
            customerId,
            address: addressID,
            itemId,
            totalAmount: actualPaidAmount || 0,
            shipping_charge: shipping_charge || 0,
            paymentType: paymentTypeStr,
            paymentId: String(successfulPayment.cf_payment_id),
            paymentStatus: "paid",
            status: "placed",
        });

        // Add payment to customer payment table
        const paymentRecord = await tablesDB.createRow(db, customerPaymentTable, ID.unique(), {
            amount: actualPaidAmount,
            customerId: customerId,
            transitionId: String(successfulPayment.cf_payment_id)
        });

        // Clear customer cart and update order/payment history
        const currentOrderHistory = customer.orderHistory ? [...customer.orderHistory, onlineOrder.$id] : [onlineOrder.$id];
        const currentPaymentHistory = customer.paymentHistory ? [...customer.paymentHistory, paymentRecord.$id] : [paymentRecord.$id];

        const updateData: any = {
            orderHistory: currentOrderHistory,
            paymentHistory: currentPaymentHistory
        };

        if (!isDirect) {
            updateData.cartId = [];
        }

        await tablesDB.updateRow(db, customerTable, customerId, updateData);

        return NextResponse.json({ success: true, order: onlineOrder });
    } catch (error: any) {
        console.error("Cashfree verify error:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
    }
}