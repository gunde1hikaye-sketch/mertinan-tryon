import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // ======================
    // AUTH HEADER
    // ======================
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Missing token" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // ======================
    // SUPABASE SERVER CLIENT
    // ======================
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ======================
    // USER DOĞRULA
    // ======================
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid session" },
        { status: 401 }
      );
    }

    // ======================
    // 🔥 KREDİ DÜŞ
    // ======================
    const { data, error } = await supabase.rpc("consume_credit");

    if (error) {
      console.error("CREDIT ERROR:", error);
      return NextResponse.json(
        { error: "credit_error", message: "Credit check failed" },
        { status: 500 }
      );
    }

    if (data === -1) {
      return NextResponse.json(
        {
          error: "no_credits",
          message: "Deneme hakkın bitti",
        },
        { status: 402 }
      );
    }

    console.log("✅ CREDIT USED. REMAINING:", data);

    // ======================
    // ⏩ BURADAN SONRASI TRY-ON
    // (fal.ai / kling vs.)
    // ======================

    return NextResponse.json({
      ok: true,
      remainingCredits: data,
    });
  } catch (err: any) {
    console.error("SERVER ERROR:", err);
    return NextResponse.json(
      { error: "server_error", message: err.message },
      { status: 500 }
    );
  }
}
