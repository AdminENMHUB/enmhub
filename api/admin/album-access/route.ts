// src/app/api/admin/album-access/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("album_access")
    .select("album_id, grantee_id, status, created_at, albums:album_id (title, owner_id)")
    .eq("status","requested")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ requests: data ?? [] });
}

export async function POST(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { album_id, grantee_id, action } = await req.json().catch(() => ({}));
  if (!album_id || !grantee_id || !["approve","deny"].includes(action)) {
    return NextResponse.json({ error: "album_id_grantee_id_action_required" }, { status: 400 });
  }
  const admin = supabaseAdmin();
  const status = action === "approve" ? "approved" : "denied";
  const { error } = await admin
    .from("album_access")
    .update({ status })
    .eq("album_id", album_id)
    .eq("grantee_id", grantee_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
