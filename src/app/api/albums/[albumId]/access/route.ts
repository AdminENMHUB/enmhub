// src/app/api/albums/[albumId]/access/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type Params = { params: { albumId: string } };

export async function POST(_: Request, { params }: Params) {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const { albumId } = params;

  const { error } = await supa
    .from("album_access")
    .insert({ album_id: albumId, grantee_id: user.id, status: "requested" });

  if (error && !/duplicate key/.test(error.message)) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
