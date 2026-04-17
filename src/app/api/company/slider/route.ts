import { authenticateServer } from "@/lib/serverAuth";
import { db, sliderTable } from "@/models/name";
import { NextResponse, NextRequest } from "next/server";
import { tablesDB } from "@/models/server/config";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateServer(request);
        if (!auth || !auth.user.labels?.includes("owner")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { sliderImage } = await request.json();
        
        const slider = await tablesDB.createRow(db, sliderTable, ID.unique(), {
            sliderImage: sliderImage,
        });
        return NextResponse.json({ slider });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const sliders = await tablesDB.listRows(db, sliderTable);
        return NextResponse.json({ sliders });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const sliderId = request.nextUrl.searchParams.get("id");
        if (!sliderId) {
            return NextResponse.json({ error: "id is required" }, { status: 400 });
        }
        await tablesDB.deleteRow(db, sliderTable, sliderId);
        return NextResponse.json({ message: "Slider deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
