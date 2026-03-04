import { db, productTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";


export async function POST( request: NextRequest) {
    try {
        const {id} = await request.json()
        // console.log(id);
        

        const product = await tablesDB.getRow(db, productTable, id)

        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({error})
    }
}