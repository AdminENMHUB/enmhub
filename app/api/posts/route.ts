import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("posts")
    .select("id, author_id, body, is_nsfw, visibility, created_at")
    .eq("visibility","public")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { text, is_nsfw = true, visibility = "public" } = body;

  const { data, error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, body: text, is_nsfw, visibility })
    .select("id, author_id, body, is_nsfw, visibility, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}
