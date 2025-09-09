#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const origin = process.env.APP_ORIGIN || "http://localhost:3000";
if (!url || !service) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }
const supabase = createClient(url, service, { auth: { persistSession: false } });

async function idsToEmbed() {
  const forceAll = process.argv.includes("--all");
  const { data: all, error: uErr } = await supabase.from("users").select("id");
  if (uErr) throw uErr;
  if (forceAll) return (all || []).map(r => r.id);

  const { data: have, error: eErr } = await supabase.from("profile_embeddings").select("user_id");
  if (eErr) throw eErr;
  const set = new Set((have || []).map(r => r.user_id));
  return (all || []).map(r => r.id).filter(id => !set.has(id));
}

async function upsertOne(id) {
  const res = await fetch(`${origin}/api/embeddings/upsert`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ user_id: id }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} – ${await res.text()}`);
}

(async () => {
  const ids = await idsToEmbed();
  console.log(`Need to embed ${ids.length} users`);
  for (const id of ids) {
    try { await upsertOne(id); console.log(`✓ ${id}`); }
    catch (e) { console.error(`✗ ${id}:`, e.message || e); }
  }
  console.log("Done.");
})();
