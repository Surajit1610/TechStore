import { authenticateServer } from "@/lib/serverAuth";
import { db, productTable } from "@/models/name";
import { NextRequest, NextResponse } from "next/server";
import { tablesDB } from "@/models/server/config";

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateServer(request);
        if (!auth || !auth.user.labels?.includes("owner")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "id is required" }, { status: 400 });
        }
        await tablesDB.deleteRow(db, productTable, id);
        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
