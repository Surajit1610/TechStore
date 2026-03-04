import { NextRequest, NextResponse } from "next/server";

const SHIPROCKET_URL = "https://apiv2.shiprocket.in";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // Call tracking endpoint (Shiprocket external courier tracking)
    const trackRes = await fetch(`${SHIPROCKET_URL}/v1/external/courier/track?order_id=${encodeURIComponent(orderId)}`, {
      method: "GET",
    });

    const trackData = await trackRes.json();
    if (!trackRes.ok) {
      return NextResponse.json({ error: "Failed to get tracking info", details: trackData }, { status: trackRes.status });
    }

    return NextResponse.json({ success: true, data: trackData });
  } catch (error) {
    console.error("Shiprocket tracking error:", error);
    return NextResponse.json({ error: "Failed to get tracking info" }, { status: 500 });
  }
}