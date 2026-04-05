import { db, onlineOrderTable, customerTable, itemTable, productTable } from "@/models/name";
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

    // Fetch items and their product images
    const items = await Promise.all(
      (order.itemId || []).map(async (id: string) => {
        const item = await tablesDB.getRow(db, itemTable, id).catch(() => null);
        if (item && item.productId) {
          const product = await tablesDB.getRow(db, productTable, item.productId).catch(() => null);
          if (product && product.images && product.images.length > 0) {
            item.imageUrl = product.images[0];
          }
        }
        return item;
      })
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