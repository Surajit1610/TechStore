import { authenticateServer } from "@/lib/serverAuth";
import { NextResponse, NextRequest } from "next/server";
import { ID } from "node-appwrite";
import { tablesDB } from "@/models/server/config";
import { db, categoryTable } from "@/models/name";

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateServer(request);
        if (!auth || !auth.user.labels?.includes("owner")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { categoryName, categoryImage } = await request.json();

        const category = await tablesDB.createRow(db, categoryTable, ID.unique(), {
            categoryName: categoryName,
            categoryImage: categoryImage,
            subcategory: [],
        });

        return NextResponse.json({ category });
    } catch (error) {
        return NextResponse.json({ error });
    }
}
