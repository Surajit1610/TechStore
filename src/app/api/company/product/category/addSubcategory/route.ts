import { NextResponse, NextRequest } from "next/server";
import { ID } from "node-appwrite";
import { storage, tablesDB } from "@/models/server/config";
import { save_moreBucket, db, subcategoryTable, categoryTable } from "@/models/name";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get("image") as File;
        const subcategoryName = formData.get("subcategoryName") as string;
        const categoryId = formData.get("categoryId") as string;    

        const UploadedSubcategoryImage = await storage.createFile(
            save_moreBucket,
            ID.unique(),
            image
        );  
        const subcategoryImageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${save_moreBucket}/files/${UploadedSubcategoryImage.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

        console.log(subcategoryImageUrl);

        const subcategory = await tablesDB.createRow(db, subcategoryTable, ID.unique(), {
            subcategoryName: subcategoryName,
            subcategoryImage: subcategoryImageUrl,
        });
        console.log(subcategory)

        const category = await tablesDB.getRow(db, categoryTable, categoryId);
            category.subcategory.push(subcategory.$id);
            const updatedCategory = await tablesDB.updateRow(db, categoryTable, category.$id, category);
        console.log(updatedCategory);
        return NextResponse.json({ updatedCategory });
    } catch (error) {
        return NextResponse.json({ error });
    }
}