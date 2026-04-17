import { authenticateServer } from "@/lib/serverAuth";
import { db, customerTable, notificationTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "appwrite";

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateServer(request);
        if (!auth || !auth.user.labels?.includes("owner")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { message } = await request.json();

        if (!message || message.trim() === '') {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        let hasMore = true;
        let offset = 0;
        const limit = 50;
        let notifiedCount = 0;

        // Iterate through all customers and broadcast the notification
        while (hasMore) {
            const customers = await tablesDB.listRows(db, customerTable, [
                Query.limit(limit),
                Query.offset(offset)
            ]);

            if (customers.rows.length === 0) {
                hasMore = false;
                break;
            }

            const promises = customers.rows.map(async (customer) => {
                // 1. Create the notification record
                await tablesDB.createRow(db, notificationTable, ID.unique(), {
                    userId: customer.$id,
                    notification: message
                });
                
                // 2. Set hasUnreadNotification to true
                await tablesDB.updateRow(db, customerTable, customer.$id, {
                    hasUnreadNotification: true
                });
            });

            await Promise.all(promises);
            notifiedCount += customers.rows.length;
            offset += limit;
        }

        return NextResponse.json({ success: true, count: notifiedCount, message: "Broadcast sent successfully" });
    } catch (error) {
        console.error("Error broadcasting notifications:", error);
        return NextResponse.json({ error: "Failed to broadcast notifications" }, { status: 500 });
    }
}
