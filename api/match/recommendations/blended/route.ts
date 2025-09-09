import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Req = {
  user_id: string;
  limit?: number;
  radius_km?: number;
  min_age?: number;
  max_age?: number;
  age_span?: number;
  w_vec?: number;
  w_geo?: number;
  w_age?: number;
  must_have_public_photo?: boolean;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Req;

    const {
      user_id,
      limit = 20,
      radius_km = 250,
      min_age = 18,
      max_age = 120,
      age_span = 20,
      w_vec = 0.7,
      w_geo = 0.2,
      w_age = 0.1,
      must_have_public_photo = true,
    } = body;

    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

    const { data: rows, error } = await supabaseAdmin.rpc("match_candidates_blended", {
      p_user_id: user_id,
      p_limit: limit,
      p_radius_km: radius_km,
      p_min_age: min_age,
      p_max_age: max_age,
      p_age_span: age_span,
      p_w_vec: w_vec,
      p_w_geo: w_geo,
      p_w_age: w_age,
      p_must_have_public_photo: must_have_public_photo,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (!rows?.length) return NextResponse.json({ ok: true, candidates: [] });

    // Join summary info for rendering
    const ids = rows.map((r: any) => r.user_id);
    const { data: users, error: uErr } = await supabaseAdmin
      .from("users")
      .select("id, username, verified, premium, age_years, lat, lng, profiles(vibe), photos(path)")
      .in("id", ids);

    if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });

    const byId = new Map(users.map((u: any) => [u.id, u]));
    const merged = rows.map((r: any) => ({ ...byId.get(r.user_id), _score: r.score, _sim_vec: r.sim_vec, _score_geo: r.score_geo, _score_age: r.score_age, _distance_km: r.distance_km }));

    return NextResponse.json({ ok: true, candidates: merged });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
