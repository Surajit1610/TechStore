import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';



cloudinary.config({ 
        cloud_name: process.env.COLUDINARY_CLOUD_NAME, 
        api_key: process.env.COLUDINARY_API_KEY, 
        api_secret: process.env.COLUDINARY_API_SECRET 
});

export async function POST(request: NextRequest){
   try {
    const data = await request.formData()
   const file = data.get("file") as File

   const fileName = file.name
   
   if(!file){
    return NextResponse.json({
      message: "file is required",
      success: false
    }, {
      status: 400
    })
   }
   const fileBuffer = await file.arrayBuffer()
   const buffer = Buffer.from(fileBuffer)

   const res = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    })
    stream.end(buffer)
   })

   return NextResponse.json({res, status: 201, message: "file uploaded successfully"})

   } catch (error) {

    const data = await request.formData()
   const file = data.get("file") as File

    return NextResponse.json(error, {
      status: 501 
   })
   }

}



