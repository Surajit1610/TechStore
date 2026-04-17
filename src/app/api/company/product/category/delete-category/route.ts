import { authenticateServer } from "@/lib/serverAuth";
import {db, categoryTable, subcategoryTable} from "@/models/name";
import {tablesDB} from "@/models/server/config";
import {Query} from "appwrite";
import {NextResponse, NextRequest} from "next/server";

export async function POST(request: NextRequest) {
    try {
        const auth = await authenticateServer(request);
        if (!auth || !auth.user.labels?.includes("owner")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id, subcategory }: { id: string, subcategory: string[] } = await request.json();

        // Delete subcategories associated with the category
        for (let i = 0; i < subcategory.length; i++) {
            await tablesDB.deleteRow(db, subcategoryTable, subcategory[i]);
        }

        // Delete the category
        await tablesDB.deleteRow(db, categoryTable, id);

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error });
    }
}
