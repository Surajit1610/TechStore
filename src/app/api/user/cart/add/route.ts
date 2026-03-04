import { db, customerTable, itemTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "appwrite";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerID, productID, qty, productName, slug, price } = body;
    if (!customerID || !productID || !productName || !slug || !qty || qty < 1 || !price || price < 1) {
      return NextResponse.json({ success: false, message: "Invalid input" }, { status: 400 });
    }
    const customer = await tablesDB.getRow(db, customerTable, customerID);

    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    const item = await tablesDB.createRow(db, itemTable, ID.unique(), {
      productId: productID,
      productName,
      slug,
      quantity: qty,
      price,
    });

    const updatedCart = customer.cartId ? [...customer.cartId, item.$id] : [item.$id];
    await tablesDB.updateRow(db, customerTable, customerID, { cartId: updatedCart });

    return NextResponse.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to add item to cart" }, { status: 500 });
  }
}