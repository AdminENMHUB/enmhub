import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const k = Number(searchParams.get("k") ?? 12);
  const max_miles = Number(searchParams.get("max_miles") ?? 500);

  if (!user_id) {
    return NextResponse.json({ error: "missing user_id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.rpc("fn_match_recommendations", {
    p_user_id: user_id,
    p_k: k,
    p_max_miles: max_miles,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ user_id, k, candidates: data ?? [] });
}
