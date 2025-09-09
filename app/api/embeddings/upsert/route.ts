import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "text-embedding-3-small"; // 1536 dims

export const runtime = "nodejs";

async function buildSignature(user_id: string) {
  const [{ data: user }, { data: profile }, { data: tags }] = await Promise.all([
    supabaseAdmin.from("users").select("username,email").eq("id", user_id).maybeSingle(),
    supabaseAdmin.from("profiles").select("bio,vibe").eq("user_id", user_id).maybeSingle(),
    supabaseAdmin.from("user_interests").select("interests(label,slug)").eq("user_id", user_id),
  ]);

  const labels = (tags ?? [])
    .map((r: any) => r.interests?.label || r.interests?.slug)
    .filter(Boolean);

  const lines = [
    `username: ${user?.username ?? ""}`,
    profile?.vibe ? `vibe: ${profile.vibe}` : "",
    profile?.bio ? `bio: ${profile.bio}` : "",
    labels.length ? `interests: ${labels.join(", ")}` : "",
  ].filter(Boolean);

  return lines.length ? lines.join("\n") : `username: ${user?.username ?? user_id}`;
}

async function embed(text: string) {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, input: text }),
  });

  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.error?.message || "OpenAI embeddings error");

  const vector: number[] = payload?.data?.[0]?.embedding;
  if (!Array.isArray(vector) || !vector.length) throw new Error("No embedding returned");
  return vector;
}

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();
    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });

    const signature = await buildSignature(user_id);
    const vector = await embed(signature);

    const { error } = await supabaseAdmin
      .from("profile_embeddings")
      .upsert({ user_id, embedding: vector, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[embeddings/upsert] error:", e?.message || e);
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
