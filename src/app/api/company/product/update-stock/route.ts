import { db, productTable } from "@/models/name";
import { NextRequest, NextResponse } from "next/server";
import { tablesDB } from "@/models/server/config";

export async function POST(request: NextRequest) {
    try {
        const { Id, stockValue } = await request.json();
        await tablesDB.updateRow(db, productTable, Id, { stock: stockValue });
        return NextResponse.json({ message: "Stock updated successfully" });
    } catch (error) {
        return NextResponse.json({ error });
    }
}