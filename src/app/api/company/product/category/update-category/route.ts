import { NextResponse, NextRequest } from "next/server";
import { tablesDB } from "@/models/server/config";
import { db, categoryTable } from "@/models/name";

export async function POST(request: NextRequest) {
    try {
        const { categoryId, categoryName, categoryImage } = await request.json();

        const updateData: any = { categoryName };

        if (categoryImage) {
            updateData.categoryImage = categoryImage;
        }

        const category = await tablesDB.updateRow(db, categoryTable, categoryId, updateData);

        return NextResponse.json({ category });
    } catch (error) {
        return NextResponse.json({ error });
    }
}