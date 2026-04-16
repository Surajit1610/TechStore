import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { db, customerTable, itemTable, productTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET_KEY
);

export async function POST(request: NextRequest) {
    try {
        const { customerId, phone, name, email, isDirect, itemId } = await request.json();

        if (!customerId) {
            return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
        }

        // Calculate total amount server-side to prevent price tampering
        const customer = await tablesDB.getRow(db, customerTable, customerId);
        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 400 });
        }

        const itemsToCalculate = isDirect ? itemId : customer.cartId;

        if (!itemsToCalculate || itemsToCalculate.length === 0) {
            return NextResponse.json({ error: "No items to checkout" }, { status: 400 });
        }

        let serverTotalAmount = 0;
        for (const id of itemsToCalculate) {
            try {
                const item = await tablesDB.getRow(db, itemTable, id);
                if (!item) {
                    return NextResponse.json({ error: "Cart item not found" }, { status: 400 });
                }
                if (item && item.productId) {
                    const product = await tablesDB.getRow(db, productTable, item.productId);
                    if (product && typeof product.finalPrice === 'number') {
                        serverTotalAmount += product.finalPrice * item.quantity;
                        // Sync the snapshot item with the latest price to ensure verification uses the current live price
                        await tablesDB.updateRow(db, itemTable, id, { 
                            price: product.finalPrice,
                            productName: product.productName
                        });
                    } else {
                        return NextResponse.json({ error: "One or more products in your cart are no longer available" }, { status: 400 });
                    }
                }
            } catch (err) {
                console.error(`Error fetching item/product details for item ID ${id}:`, err);
                return NextResponse.json({ error: "Internal server error during validation" }, { status: 500 });
            }
        }

        if (serverTotalAmount <= 0) {
            return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });
        }

        // Unique order ID for cashfree
        const cashfreeOrderId = `order_${Date.now()}_${customerId.substring(0, 5)}`;

        const requestObj = {
            order_amount: serverTotalAmount,
            order_currency: "INR",
            order_id: cashfreeOrderId,
            customer_details: {
                customer_id: customerId,
                customer_phone: phone || "9999999999",
                customer_name: name || "Customer",
                customer_email: email || "customer@example.com"
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/user/cart?cf_id={order_id}`
            }
        };

        const response = await cashfree.PGCreateOrder(requestObj);
        
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Cashfree order creation error:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
    }
}