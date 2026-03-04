import { productTable, db } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const productId = formData.get("productId") as string; // Ensure productId is treated as a string
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

        console.log(productId, productName, description, priceNum, finalPriceNum, category, subcategory, images);

        const product = await tablesDB.updateRow(db, productTable, productId, {
            productName: productName,
            slug: slug,
            description: description,
            price: priceNum,
            finalPrice: finalPriceNum,
            category: category,
            subcategory: subcategory,
            images: images,
        })
        return NextResponse.json(product)
    } catch (error) {
        return NextResponse.json({ error });
    }
}