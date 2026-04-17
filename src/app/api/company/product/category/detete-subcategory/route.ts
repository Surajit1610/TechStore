import { authenticateServer } from "@/lib/serverAuth";
import { db, subcategoryTable, categoryTable } from "@/models/name";
import { NextResponse, NextRequest } from "next/server";
import { tablesDB } from "@/models/server/config";

export async function POST(request: NextRequest) {
  try {
        const auth = await authenticateServer(request);
        if (!auth || !auth.user.labels?.includes("owner")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subcategoryId, categoryId } = await request.json();
    if (!subcategoryId) {
      return NextResponse.json({ message: "Subcategory ID is required" }, { status: 400 });
    }
    await tablesDB.deleteRow(db, subcategoryTable, subcategoryId);

    const category = await tablesDB.getRow(db, categoryTable, categoryId);
    if (category) {
      category.subcategory = category.subcategory.filter((id: string) => id !== subcategoryId);
      await tablesDB.updateRow(db, categoryTable, category.$id,{ 
        subcategory: category.subcategory
        }
      );
    }
    return NextResponse.json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
