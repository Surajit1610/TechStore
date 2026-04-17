import { db, supportMessageTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { authenticateServer } from "@/lib/serverAuth";
import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

// Public POST route: allow anyone (including guests) to create a support message.
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json({
                error: "Name, email, subject, and message are required"
            }, { status: 400 });
        }

        // We use the server-side tablesDB which is authenticated with the API key
        // to bypass the need for a user session.
        const newSupportMessage = await tablesDB.createRow(db, supportMessageTable, ID.unique(), {
            name,
            email,
            phone: phone || "",
            subject,
            message,
            status: "Open",
            createdAt: new Date().toISOString()
        });

        return NextResponse.json(newSupportMessage);

    } catch (error: any) {
        console.error("Support message creation error:", error);
        return NextResponse.json({
            error: "An error occurred while sending your support request."
        }, { status: 500 });
    }
}

// Protected GET route: fetch all messages for dashboard
export async function GET(request: Request) {
    try {
        const auth = await authenticateServer(request);
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Retrieve support messages
        const response = await tablesDB.listRows(db, supportMessageTable, [
            Query.orderDesc("createdAt")
        ]);

        return NextResponse.json(response.rows);
    } catch (error) {
        console.error("Error fetching support messages:", error);
        return NextResponse.json({
            error: "An error occurred while fetching support messages."
        }, { status: 500 });
    }
}

// Protected PUT route: update the status of a message
export async function PUT(request: Request) {
    try {
        const auth = await authenticateServer(request);
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { messageId, status } = body;

        if (!messageId || !status) {
            return NextResponse.json({ error: "Message ID and updated status are required" }, { status: 400 });
        }

        const updatedMessage = await tablesDB.updateRow(db, supportMessageTable, messageId, {
            status
        });

        return NextResponse.json(updatedMessage);

    } catch (error) {
        console.error("Error updating support message:", error);
        return NextResponse.json({
            error: "An error occurred while updating the support message."
        }, { status: 500 });
    }
}
