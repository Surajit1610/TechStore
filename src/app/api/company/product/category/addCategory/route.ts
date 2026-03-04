
import { NextResponse, NextRequest } from "next/server";
import { ID } from "node-appwrite";
import { storage, tablesDB } from "@/models/server/config";
import { save_moreBucket, db, categoryTable } from "@/models/name";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get("image") as File;
        const categoryName = formData.get("categoryName") as string;

        const UploadedCategoryImage = await storage.createFile(
            save_moreBucket,
            ID.unique(),
            image
        );

        const categoryImageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${save_moreBucket}/files/${UploadedCategoryImage.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

        console.log(categoryImageUrl);
            

        const category = await tablesDB.createRow(db, categoryTable, ID.unique(), {
            categoryName: categoryName,
            categoryImage: categoryImageUrl,
            subcategory: [],
        });

        return NextResponse.json({ category });
    } catch (error) {
        return NextResponse.json({ error });
    }
}