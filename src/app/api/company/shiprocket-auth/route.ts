import { NextResponse } from "next/server";

export async function POST() {
  try {
    const shiprocketUserDetails = process.env.SHIPROCKET_USER_DETAILS;
    const shiprocketPassword = process.env.SHIPROCKET_PASSWORD;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "email": shiprocketUserDetails,
      "password": shiprocketPassword
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", requestOptions);
    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: result }, { status: response.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
