import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { userId, path } = await req.json();
    if (!userId || !path) return NextResponse.json({ error: "userId and path required" }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const s = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data, error } = await s.storage.from("photos").createSignedUploadUrl(path);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, signedUrl: data.signedUrl, token: data.token });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
