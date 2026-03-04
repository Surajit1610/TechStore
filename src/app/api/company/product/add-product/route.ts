import { productTable, db } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";


export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const productName = formData.get("productName")
        const slug = productName!.toString().trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-")
        const description = formData.get("description")
        const price = formData.get("price")
        const finalPrice = formData.get("finalPrice")
        const category = formData.get("category")
        const subcategory = formData.get("subcategory")
        const images = formData.getAll("images")
        const priceNum: number = parseFloat(price!.toString())
        const finalPriceNum: number = parseFloat(finalPrice!.toString())

        console.log(productName, description, priceNum, finalPriceNum, category, subcategory, images);

        const product = await tablesDB.createRow(db, productTable, ID.unique(), {
            productName: productName,
            slug: slug,
            description: description,
            price: priceNum,
            finalPrice: finalPriceNum,
            category: category,
            subcategory: subcategory,
            images: images,
            stock: 0
        })

        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({error})
    }
}