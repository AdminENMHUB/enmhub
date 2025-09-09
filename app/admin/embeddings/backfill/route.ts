import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST() {
  try {
    // up to 100 users without embeddings
    const { data: users, error } = await supabaseAdmin
      .from("users").select("id")
      .not("id", "in", (await supabaseAdmin.from("profile_embeddings").select("user_id")).data?.map((r:any)=>r.user_id) ?? [])
      .limit(100);

    if (error) throw new Error(error.message);

    for (const u of users ?? []) {
      await fetch(`${process.env.APP_ORIGIN || "http://localhost:3000"}/api/embeddings/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: u.id }),
      });
    }

    return NextResponse.json({ ok: true, processed: (users ?? []).length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
