import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { album_id, storage_path, mime_type, is_nsfw = true } = body;

  const { data: album, error: aerr } = await supabase
    .from("albums")
    .select("owner_id")
    .eq("id", album_id)
    .single();

  if (aerr) return NextResponse.json({ error: aerr.message }, { status: 400 });
  if (album.owner_id !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("album_photos")
    .insert({ album_id, owner_id: user.id, storage_path, mime_type, is_nsfw })
    .select("id, storage_path, mime_type, is_nsfw, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ photo: data });
}
