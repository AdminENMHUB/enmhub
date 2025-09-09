// pseudo: src/app/api/embeddings/rebuild/route.ts
// - auth protect in prod
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
  // fetch users needing embedding
  const { data: users } = await supabaseAdmin.from("profiles")
    .select("user_id, bio, vibe, looking_for")
    .limit(200);

  // call your embeddings provider and upsert into profile_embeddings
  // await supabaseAdmin.from("profile_embeddings").upsert({ user_id, embedding })
  return NextResponse.json({ ok: true, processed: users?.length ?? 0 });
}
