import { productTable, db } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { Query } from "appwrite";
import { NextResponse, NextRequest } from "next/server";


export async function GET(request: NextRequest) {
    try {
        const categoryName = request.nextUrl.searchParams.get('categoryName');
        // console.log(categoryName as string);
        

        const products = await tablesDB.listRows(db, productTable, [
            Query.equal("category", [categoryName as string]),
        ])
        console.log(products);

        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const subcategoryName = formData.get("subcategoryName") as string;

        const products = await tablesDB.listRows(db, productTable, [
            Query.equal("subcategory", [subcategoryName as string]),
        ])
        console.log(products);

        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error });
    }
}