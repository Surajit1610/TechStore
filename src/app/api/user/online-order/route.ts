import { db, customerTable, onlineOrderTable, addressTable, itemTable, productTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerId, addressID, itemId, shipping_charge, paymentType, isDirect } = data;

    if (!customerId || !addressID || !itemId || !Array.isArray(itemId) || itemId.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // validate customer
    const customer = await tablesDB.getRow(db, customerTable, customerId);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // get address
    // const address = await tablesDB.getRow(db, addressTable, addressID);
    // if (!address) {
    //     return NextResponse.json({ error: "Address not found" }, { status: 404 });
    // }

    // Calculate total amount server-side to prevent price tampering
    let serverTotalAmount = 0;
    for (const id of itemId) {
        try {
            const item = await tablesDB.getRow(db, itemTable, id);
            if (item && item.productId) {
                const product = await tablesDB.getRow(db, productTable, item.productId);
                if (product && typeof product.finalPrice === 'number') {
                    serverTotalAmount += product.finalPrice * item.quantity;
                }
            }
        } catch (err) {
            console.error(`Error fetching item/product details for item ID ${id}:`, err);
        }
    }

    if (serverTotalAmount <= 0) {
        return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    // create online order row
    const onlineOrder = await tablesDB.createRow(db, onlineOrderTable, ID.unique(), {
      customerId,
      address: addressID,
      itemId,
      totalAmount: serverTotalAmount,
      shipping_charge: shipping_charge || 0,
      paymentType: paymentType || "cod",
      paymentStatus: "unpaid",
      status: "placed",
    });

    // clear customer's cart and push order id into orderHistory if available
    const currentOrderHistory = customer.orderHistory ? [...customer.orderHistory, onlineOrder.$id] : [onlineOrder.$id];

    const updateData: any = {
      orderHistory: currentOrderHistory,
    };

    if (!isDirect) {
      updateData.cartId = [];
    }

    await tablesDB.updateRow(db, customerTable, customerId, updateData);

    
    return NextResponse.json(onlineOrder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}