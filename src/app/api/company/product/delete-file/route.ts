import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.COLUDINARY_CLOUD_NAME,
  api_key: process.env.COLUDINARY_API_KEY,
  api_secret: process.env.COLUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const public_id = formData.get('public_id') as string;

    if (!public_id) {
      return NextResponse.json(
        {
          message: 'public_id is required',
          success: false,
        },
        {
          status: 400,
        }
      );
    }

    const res = await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({
      res,
      success: true,
      message: 'file deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: (error as Error).message,
        success: false,
      },
      { status: 500 }
    );
  }
}
