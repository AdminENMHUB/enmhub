// src/app/api/match/recommendations/advanced/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const user_id = url.searchParams.get("user_id");
    const k = parseInt(url.searchParams.get("k") || "12", 10);
    const maxMilesParam = url.searchParams.get("max_miles");
    const max_miles = maxMilesParam ? parseInt(maxMilesParam, 10) : null;

    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

    const { data, error } = await supabaseAdmin.rpc("advanced_match_candidates", {
      p_user_id: user_id,
      p_k: k,
      p_max_miles: max_miles,
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({
      user_id,
      k,
      max_miles,
      candidates: (data || []).map((r: any) => ({
        user: { id: r.candidate_user_id, username: r.username, email: r.email },
        similarity: r.similarity,
        score: r.score,
        components: r.components,
        distance_mi: r.distance_mi,
        preference_overlap: r.preference_overlap,
        seek_ok: r.seek_ok,
        exp_similarity: r.exp_similarity,
        age_score: r.age_score,
        attr_score: r.attr_score,
        embedding_updated_at: r.embedding_updated_at,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
