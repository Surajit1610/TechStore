import { authenticateServer } from "@/lib/serverAuth";
import { db, productTable } from "@/models/name";
import { NextRequest, NextResponse } from "next/server";
import { tablesDB } from "@/models/server/config";

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateServer(request);
        if (!auth || !auth.user.labels?.includes("owner")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { Id, stockValue } = await request.json();
        await tablesDB.updateRow(db, productTable, Id, { stock: stockValue });
        return NextResponse.json({ message: "Stock updated successfully" });
    } catch (error) {
        return NextResponse.json({ error });
    }
}
