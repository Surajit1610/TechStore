import { db, onlineOrderTable, customerTable, itemTable, productTable, addressTable, notificationTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextResponse, NextRequest } from "next/server";
import { Query } from "appwrite";
import { ID } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    let queries: any[] = [Query.limit(limit), Query.offset(offset), Query.orderDesc("$createdAt")];

    // Filter by status if provided
    if (status && status !== "all") {
      queries.push(Query.equal("status", status));
    }

    const orders = await tablesDB.listRows(db, onlineOrderTable, queries);

    // Enrich orders with customer and item details
    const enrichedOrders = await Promise.all(
      orders.rows.map(async (order: any) => {
        try {
          // Fetch customer details
          const customer = await tablesDB.getRow(db, customerTable, order.customerId);

          // Fetch address details
          const addressData = await tablesDB.getRow(db, addressTable, order.address);

          // Fetch item details
          const itemDetails = await Promise.all(
            (order.itemId || []).map((id: string) =>
              tablesDB
                .getRow(db, itemTable, id)
                .catch(() => null)
            )
          );
          

          return {
            ...order,
            customer: customer || {},
            items: itemDetails.filter(Boolean),
            addressData: addressData || {},
          };
        } catch (err) {
          console.error(`Error enriching order ${order.$id}:`, err);
          return { ...order, customer: {}, items: [] };
        }
      })
    );

    return NextResponse.json({
      orders: enrichedOrders,
      total: orders.total,
      page,
      limit,
      totalPages: Math.ceil(orders.total / limit),
    });
  } catch (error) {
    console.error("Error fetching online orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, shiprocketOrderId, awb } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (shiprocketOrderId) updateData.shiprocketOrderId = shiprocketOrderId;
    if (awb) updateData.awb = awb;

    const updatedOrder = await tablesDB.updateRow(
      db,
      onlineOrderTable,
      orderId,
      updateData
    );

    if (status && updatedOrder.customerId) {
      try {
        await tablesDB.updateRow(db, customerTable, updatedOrder.customerId, {
          hasUnreadNotification: true
        });
        await tablesDB.createRow(db, notificationTable, ID.unique(), {
          userId: updatedOrder.customerId,
          notification: `Update! Your order (#${orderId.slice(-6).toUpperCase()}) status is now: ${status}.`
        });
      } catch (notifErr) {
        console.error("Failed to create order status update notification:", notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}