import { authenticateServer } from "@/lib/serverAuth";
import { db, featuredProductTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { Query } from "appwrite";


export async function GET() {
    try {
        const response = await tablesDB.listRows(db, featuredProductTable, [
            Query.orderDesc("$createdAt"),
        ]);
        return NextResponse.json({ products: response.rows });
    } catch (error) {
        console.error("Error fetching featured products:", error);
        return NextResponse.json({ error: "Failed to fetch featured products" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await authenticateServer(req);
        if (!auth || !auth.user.labels?.includes("owner")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, productIds } = await req.json();

        if (!title || !productIds || productIds.length === 0) {
            return NextResponse.json({ error: "Title and at least one Product ID are required" }, { status: 400 });
        }

        const newProduct = await tablesDB.createRow(
            db,
            featuredProductTable,
            ID.unique(),
            {
                title,
                productIds,
            }
        );

        return NextResponse.json(newProduct);
    } catch (error) {
        console.error("Error creating featured product:", error);
        return NextResponse.json({ error: "Failed to create featured product" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { id, title, productIds } = await req.json();

        if (!id || !title || !productIds || productIds.length === 0) {
            return NextResponse.json({ error: "ID, Title, and at least one Product ID are required" }, { status: 400 });
        }

        const updatedProduct = await tablesDB.updateRow(
            db,
            featuredProductTable,
            id,
            {
                title,
                productIds,
            }
        );

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("Error updating featured product:", error);
        return NextResponse.json({ error: "Failed to update featured product" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
        }

        await tablesDB.deleteRow(db, featuredProductTable, id);

        return NextResponse.json({ message: "Featured product deleted successfully" });
    } catch (error) {
        console.error("Error deleting featured product:", error);
        return NextResponse.json({ error: "Failed to delete featured product" }, { status: 500 });
    }
}

