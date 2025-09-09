// src/app/api/ai/aesthetic/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// Pseudo-vision scoring: return a 0..1 "aesthetic quality" score from image(s)
// This should call your vision model endpoint. Here we stub with fixed value.
// Replace with your own logic (OpenAI Vision, etc.), making sure you:
//   • respect allow_ai_aesthetic
//   • avoid protected attributes and any disallowed content
async function scoreImages(_urls: string[]): Promise<number> {
  // TODO: call your provider; clamp 0..1
  return 0.65;
}

export async function POST(req: Request) {
  try {
    const { user_id, image_urls } = await req.json();
    if (!user_id || !Array.isArray(image_urls) || image_urls.length === 0) {
      return NextResponse.json({ error: "user_id and image_urls[] required" }, { status: 400 });
    }

    const { data: settings } = await supabaseAdmin
      .from("user_settings").select("allow_ai_aesthetic").eq("user_id", user_id).maybeSingle();

    if (!settings?.allow_ai_aesthetic) {
      return NextResponse.json({ error: "user has not opted in" }, { status: 403 });
    }

    const score = await scoreImages(image_urls);
    const { error } = await supabaseAdmin
      .from("aesthetic_ai")
      .upsert({ user_id, score, model: "your-vision-model", updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, score });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
