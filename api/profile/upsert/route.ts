import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type Body = {
  user_id: string;
  username?: string;
  email?: string;
  lat?: number | null;
  lng?: number | null;
  birthdate?: string | null; // ISO date 'YYYY-MM-DD'
  age?: number | null;       // optional fallback if no birthdate
  profile?: {
    bio?: string | null;
    vibe?: string | null;
  };
  reembed?: boolean; // default true
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const {
      user_id,
      username,
      email,
      lat = null,
      lng = null,
      birthdate = null,
      age = null,
      profile,
      reembed = true,
    } = body || {};

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    // Upsert into public.users
    {
      const updates: Record<string, any> = { id: user_id };
      if (username !== undefined) updates.username = username;
      if (email !== undefined) updates.email = email;
      if (lat !== undefined) updates.lat = lat;
      if (lng !== undefined) updates.lng = lng;
      if (birthdate !== undefined) updates.birthdate = birthdate;
      if (age !== undefined) updates.age = age;

      const { error } = await supabaseAdmin
        .from("users")
        .upsert(updates, { onConflict: "id" });
      if (error) throw new Error(`users upsert: ${error.message}`);
    }

    // Upsert into public.profiles (optional table)
    if (profile) {
      const { bio = null, vibe = null } = profile;
      const { error } = await supabaseAdmin
        .from("profiles")
        .upsert({ user_id, bio, vibe }, { onConflict: "user_id" });
      if (error) throw new Error(`profiles upsert: ${error.message}`);
    }

    // Optionally refresh embedding
    if (reembed) {
      const res = await fetch(`${process.env.APP_ORIGIN || "http://localhost:3000"}/api/embeddings/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`re-embed failed: ${t}`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
