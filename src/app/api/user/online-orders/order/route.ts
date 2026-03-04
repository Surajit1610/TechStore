import { db, onlineOrderTable, customerTable, itemTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    console.log("Fetching orderId:", orderId);

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await tablesDB.getRow(db, onlineOrderTable, orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch items
    const items = await Promise.all(
      (order.itemId || []).map((id: string) =>
        tablesDB.getRow(db, itemTable, id).catch(() => null)
      )
    );

    // Fetch customer
    const customer = await tablesDB.getRow(db, customerTable, order.customerId).catch(() => null);

    return NextResponse.json({
      ...order,
      items: items.filter(Boolean),
      customer,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}