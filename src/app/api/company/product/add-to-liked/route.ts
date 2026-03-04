import { db, customerTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userID, productID } = await request.json();

        const user = await tablesDB.getRow(db, customerTable, userID);

        const likedProducts = user.likedProducts || [];

        likedProducts.push(productID);

        const result = await tablesDB.updateRow(db, customerTable, userID, {
            likedProducts: likedProducts,
        });

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error });
    }
}