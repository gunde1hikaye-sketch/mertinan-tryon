export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { run } from "@fal-ai/serverless-client";

export async function POST(req: Request) {
  console.log("=== MOCK TRY-ON MODE ACTIVE ===");

  // Read incoming image data
  const body = await req.json();
  const { modelImage, tshirtImage, generateVideo } = body;

  // ❗ MOCK: Always return a fake try-on result
  return NextResponse.json(
    {
      imageUrl: "https://beaudryflowers.ca/cdn/shop/products/shutterstock_754419700_1024x1024.jpg?v=1588706826",
      videoUrl: null,
    },
    { status: 200 }
  );
}
