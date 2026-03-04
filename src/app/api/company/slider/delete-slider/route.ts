import { db, sliderTable } from "@/models/name";
import { NextResponse, NextRequest } from "next/server";
import { tablesDB } from "@/models/server/config";

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();
        await tablesDB.deleteRow(db, sliderTable, id);
        return NextResponse.json({ message: "Slider deleted successfully" });
    } catch (error) {
        return NextResponse.json({error});
    }    
}