import { db, onlineOrderTable, customerTable, itemTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "appwrite";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const customerId = url.searchParams.get("customerId");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const orders = await tablesDB.listRows(db, onlineOrderTable, [
      Query.equal("customerId", customerId),
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ]);

    const enriched = await Promise.all(
      orders.rows.map(async (order: any) => {
        try {
          const items = await Promise.all((order.itemId || []).map((id: string) => tablesDB.getRow(db, itemTable, id).catch(() => null)));
          const customer = await tablesDB.getRow(db, customerTable, order.customerId).catch(() => null);
          return { ...order, items: items.filter(Boolean), customer };
        } catch (err) {
          console.error("Error enriching customer order:", err);
          return { ...order, items: [], customer: null };
        }
      })
    );

    return NextResponse.json({ rows: enriched, total: orders.total, page, limit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch online orders" }, { status: 500 });
  }
}


export async function PUT(request: NextRequest){
  try {
    const {ID} = await request.json()

    const user = await tablesDB.getRow(db, customerTable, ID)

    return NextResponse.json({
      exists: true, user: user
    })
  } catch (error) {
    return NextResponse.json({
      exists: false
    })
  }


}