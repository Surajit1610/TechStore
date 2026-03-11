import { customerTable, db } from "@/models/name";
import { tablesDB, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest){
    try {
        const {ID, name, email, avatar} = await request.json()


        console.log(ID, name, email, avatar);
       
            const response = await tablesDB.createRow(db, customerTable, ID as string, {
                avatar: avatar,
                name: name,
                email: email
            })
          
            return NextResponse.json(
                response,
                 {
              status: 201
            })
       
    } catch (error: any) {
        return NextResponse.json(
      {
        error: error?.message || "Error creating user row"
      },
      {
        status: error?.status || error?.code || 500
      }
    )
    }
}