import { db, sliderTable, save_moreBucket } from "@/models/name";
import { NextResponse, NextRequest } from "next/server";
import { tablesDB, storage } from "@/models/server/config";
import { ID } from "node-appwrite";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get("image") as File;
        const uplodeSliderImage = await storage.createFile(
            save_moreBucket,
            ID.unique(),
            image
        );
        const sliderImage = `${process.env.NEXT_PUBLIC_APPWRITE_HOST_URL}/storage/buckets/${save_moreBucket}/files/${uplodeSliderImage.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
        
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