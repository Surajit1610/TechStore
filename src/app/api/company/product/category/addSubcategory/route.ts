import { authenticateServer } from "@/lib/serverAuth";
import { NextResponse, NextRequest } from "next/server";
import { ID } from "node-appwrite";
import { tablesDB } from "@/models/server/config";
import { db, subcategoryTable, categoryTable } from "@/models/name";

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateServer(request);
        if (!auth || !auth.user.labels?.includes("owner")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { categoryId, subcategoryName, subcategoryImage } = await request.json();

        const subcategory = await tablesDB.createRow(db, subcategoryTable, ID.unique(), {
            subcategoryName: subcategoryName,
            subcategoryImage: subcategoryImage,
        });

        const category = await tablesDB.getRow(db, categoryTable, categoryId);
        category.subcategory.push(subcategory.$id);
        const updatedCategory = await tablesDB.updateRow(db, categoryTable, category.$id, {
            subcategory: category.subcategory
        });
        return NextResponse.json({ updatedCategory });
    } catch (error) {
        return NextResponse.json({ error });
    }
}
