
import { db, addressTable } from "@/models/name";
import { authenticateServer } from "@/lib/serverAuth";
import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get("customerId");

        if (!customerId) {
            return NextResponse.json({
                error: "Customer ID is required"
            }, { status: 400 });
        }

        const auth = await authenticateServer(request);
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const tablesDB = auth.dbClient;

        const response = await tablesDB.listRows(db, addressTable, [
            Query.equal("customerId", customerId)
        ]);

        return NextResponse.json(response.rows);

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "An error occurred while fetching the address"
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customerId, location, city, state, pincode, phone } = body;

        if (!customerId || !location || !city || !state || !pincode || !phone) {
            return NextResponse.json({
                error: "All fields are required"
            }, { status: 400 });
        }

        const auth = await authenticateServer(request);
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const tablesDB = auth.dbClient;

        const newAddress = await tablesDB.createRow(db, addressTable, ID.unique(), {
            customerId,
            location,
            city,
            state,
            pincode,
            phone
        });

        return NextResponse.json(newAddress);

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "An error occurred while creating the address"
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { documentId, location, city, state, pincode, phone } = body;

        if (!documentId || !location || !city || !state || !pincode || !phone) {
            return NextResponse.json({
                error: "All fields are required"
            }, { status: 400 });
        }

        const auth = await authenticateServer(request);
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const tablesDB = auth.dbClient;

        const updatedAddress = await tablesDB.updateRow(db, addressTable, documentId, {
            location,
            city,
            state,
            pincode,
            phone
        });

        return NextResponse.json(updatedAddress);

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "An error occurred while updating the address"
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { documentId } = body;

        if (!documentId) {
            return NextResponse.json({
                error: "Document ID is required"
            }, { status: 400 });
        }

        const auth = await authenticateServer(request);
        if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const tablesDB = auth.dbClient;

        await tablesDB.deleteRow(db, addressTable, documentId);

        return NextResponse.json({
            message: "Address deleted successfully"
        });

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "An error occurred while deleting the address"
        }, { status: 500 });
    }
}
