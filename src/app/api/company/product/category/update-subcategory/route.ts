import { NextResponse, NextRequest } from "next/server";
import { tablesDB } from "@/models/server/config";
import { db, subcategoryTable } from "@/models/name";

export async function POST(request: NextRequest) {
    try {
        const { subcategoryId, subcategoryName, subcategoryImage } = await request.json();

        const updateData: any = { subcategoryName };

        if (subcategoryImage) {
            updateData.subcategoryImage = subcategoryImage;
        }

        const subcategory = await tablesDB.updateRow(db, subcategoryTable, subcategoryId, updateData);

        return NextResponse.json({ subcategory });
    } catch (error) {
        return NextResponse.json({ error });
    }
}