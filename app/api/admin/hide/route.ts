// src/app/api/admin/hide/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { target_type, target_id, hidden } = await req.json().catch(() => ({}));
  if (!["post","photo"].includes(target_type || "")) return NextResponse.json({ error: "invalid_target_type" }, { status: 400 });
  if (!target_id) return NextResponse.json({ error: "target_id_required" }, { status: 400 });

  const admin = supabaseAdmin();
  const table = target_type === "post" ? "posts" : "photos";
  const { error } = await admin.from(table).update({ is_hidden: !!hidden }).eq("id", target_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
