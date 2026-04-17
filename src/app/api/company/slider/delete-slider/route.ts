import { authenticateServer } from "@/lib/serverAuth";
import { db, sliderTable } from "@/models/name";
import { NextResponse, NextRequest } from "next/server";
import { tablesDB } from "@/models/server/config";

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateServer(request);
        if (!auth || !auth.user.labels?.includes("owner")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await request.json();
        await tablesDB.deleteRow(db, sliderTable, id);
        return NextResponse.json({ message: "Slider deleted successfully" });
    } catch (error) {
        return NextResponse.json({error});
    }    
}
