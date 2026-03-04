import { db, notificationTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "appwrite";

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const page = parseInt(url.searchParams.get('page') || '1', 10);
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const offset = (page - 1) * limit;

        const notifications = await tablesDB.listRows(db, notificationTable, [
            Query.equal("userId", userId),
            Query.orderDesc("$createdAt"),
            Query.limit(limit + 1),
            Query.offset(offset)
        ]);

        const hasMore = notifications.rows.length > limit;
        const slicedNotifications = notifications.rows.slice(0, limit);

        return NextResponse.json({ notifications: slicedNotifications, hasMore });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}