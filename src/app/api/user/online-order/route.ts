import { db, customerTable, onlineOrderTable, addressTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerId, addressID, itemId, totalAmount, shipping_charge, paymentType } = data;

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

    // create online order row
    const onlineOrder = await tablesDB.createRow(db, onlineOrderTable, ID.unique(), {
      customerId,
      address: addressID,
      itemId,
      totalAmount: totalAmount || 0,
      shipping_charge: shipping_charge || 0,
      paymentType: paymentType || "cod",
      paymentStatus: "unpaid",
      status: "placed",
    });

    // clear customer's cart and push order id into orderHistory if available
    const currentOrderHistory = customer.orderHistory ? [...customer.orderHistory, onlineOrder.$id] : [onlineOrder.$id];

    await tablesDB.updateRow(db, customerTable, customerId, {
      cartId: [],
      orderHistory: currentOrderHistory,
    });

    
    return NextResponse.json(onlineOrder);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}