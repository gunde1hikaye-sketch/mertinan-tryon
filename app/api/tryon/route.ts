export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createFalClient } from "@fal-ai/client";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const FAL_KEY = mustEnv("FAL_KEY");

    // ✅ Resmi client
    const fal = createFalClient({ credentials: FAL_KEY });

    const body = await req.json();
    const { modelImage, tshirtImage, generateVideo } = body ?? {};

    if (!modelImage || !tshirtImage) {
      return NextResponse.json(
        { error: "modelImage ve tshirtImage zorunlu." },
        { status: 400 }
      );
    }

    const result: any = await fal.run("fal-ai/kling/v1-5/kolors-virtual-try-on", {
      input: {
        model_image: modelImage,
        garment_image: tshirtImage,
        generate_video: !!generateVideo,
      },
    });

    const imageUrl =
      result?.image?.url ||
      result?.image_url ||
      result?.output?.image?.url ||
      result?.output?.imageUrl ||
      null;

    const videoUrl =
      result?.video?.url ||
      result?.video_url ||
      result?.output?.video?.url ||
      result?.output?.videoUrl ||
      null;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "fal.ai imageUrl döndürmedi.", raw: result },
        { status: 502 }
      );
    }

    return NextResponse.json({ imageUrl, videoUrl: videoUrl ?? null }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error", message: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
