import { db, onlineOrderTable, customerTable, itemTable, productTable, addressTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    console.log("Fetching orderId:", orderId);

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    let order;
    try {
      order = await tablesDB.getRow(db, onlineOrderTable, orderId);
    } catch (err) {
      console.error("Error fetching order:", err);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch items and their product images
    let items = [];
    try {
      items = await Promise.all(
        (order.itemId || []).map(async (id: string) => {
          try {
            const item = await tablesDB.getRow(db, itemTable, id);
            if (item && item.productId) {
              const product = await tablesDB.getRow(db, productTable, item.productId);
              if (product && product.images && product.images.length > 0) {
                item.imageUrl = product.images[0];
              }
            }
            return item;
          } catch (err) {
            console.error("Error fetching item:", err);
            return null;
          }
        })
      );
    } catch (err) {
      console.error("Error fetching items:", err);
      items = [];
    }

    // Fetch customer
    let customer = null;
    try {
      customer = await tablesDB.getRow(db, customerTable, order.customerId);
    } catch (err) {
      console.error("Error fetching customer:", err);
    }

    // Parse address - it's stored as a string in the order
    let address = null;
    try {
      if (order.address) {
        // Try to parse if it's JSON
        try {
          address = typeof order.address === 'string' ? JSON.parse(order.address) : order.address;
        } catch {
          // If not JSON, it might be an address ID - try to fetch it from addresses table
          try {
            const addressFromDB = await tablesDB.getRow(db, addressTable, order.address);
            if (addressFromDB) {
              address = {
                location: addressFromDB.location,
                city: addressFromDB.city,
                state: addressFromDB.state,
                pincode: addressFromDB.pincode,
                phone: addressFromDB.phone
              };
            } else {
              address = order.address; // Keep as string if not found
            }
          } catch (err) {
            console.error("Error fetching address by ID:", err);
            address = order.address; // Keep as string if fetch fails
          }
        }
        console.log("Address data:", address);
      } else {
        console.log("No address found in order:", order.$id);
      }
    } catch (err) {
      console.error("Error processing address:", err);
    }

    return NextResponse.json({
      ...order,
      items: items.filter(Boolean),
      customer,
      address,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}