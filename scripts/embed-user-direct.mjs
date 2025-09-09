import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "text-embedding-3-small";

if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, service);

async function buildSignature(user_id) {
  const [{ data: user }, { data: profile }, { data: tags }] = await Promise.all([
    supabase.from("users").select("username,email").eq("id", user_id).maybeSingle(),
    supabase.from("profiles").select("bio,vibe").eq("user_id", user_id).maybeSingle(),
    supabase.from("user_interests").select("interests(label,slug)").eq("user_id", user_id),
  ]);

  const labels = (tags ?? [])
    .map((r) => r?.interests?.label || r?.interests?.slug)
    .filter(Boolean);

  const lines = [
    `username: ${user?.username ?? ""}`,
    profile?.vibe ? `vibe: ${profile.vibe}` : "",
    profile?.bio ? `bio: ${profile.bio}` : "",
    labels.length ? `interests: ${labels.join(", ")}` : "",
  ].filter(Boolean);

  return lines.length ? lines.join("\n") : `username: ${user?.username ?? user_id}`;
}

async function embed(text) {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, input: text }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.error?.message || "OpenAI embeddings error");
  const vector = payload?.data?.[0]?.embedding;
  if (!Array.isArray(vector) || !vector.length) throw new Error("No embedding returned");
  return vector;
}

async function upsertEmbedding(user_id) {
  const signature = await buildSignature(user_id);
  const vector = await embed(signature);
  const { error } = await supabase
    .from("profile_embeddings")
    .upsert({ user_id, embedding: vector, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
}

async function main() {
  const ids = process.argv.slice(2);
  if (!ids.length) {
    console.log("Usage: node --env-file=.env.local scripts/embed-user-direct.mjs <uuid> [more_uuids...]");
    process.exit(1);
  }
  for (const id of ids) {
    try {
      await upsertEmbedding(id);
      console.log(`${id} => ok`);
    } catch (e) {
      console.error(`${id} => ERROR: ${e.message || e}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
