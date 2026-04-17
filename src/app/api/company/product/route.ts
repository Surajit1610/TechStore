import { authenticateServer } from "@/lib/serverAuth";
import { productTable, db } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { Query } from "appwrite";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const products = await tablesDB.listRows(db, productTable, [
            // Query.select(["category", "$id", "subcategory", "productName", "price", "description", "images"]),
        ])
        console.log(products);

        return NextResponse.json(products)
    } catch (error) {
        return NextResponse.json({ error });
    }
}
