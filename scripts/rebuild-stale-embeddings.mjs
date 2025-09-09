import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const origin = process.env.APP_ORIGIN || "http://localhost:3000";
const MAX_AGE_DAYS = Number(process.env.EMBED_MAX_AGE_DAYS || "14");

if (!url || !service) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(url, service);

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function main() {
  // Find profiles that are (a) never embedded, (b) updated since last embed,
  // or (c) embeds older than MAX_AGE_DAYS.
  const { data, error } = await supabase.rpc("rebuild_embedding_candidates", {
    p_max_age_days: MAX_AGE_DAYS,
  });
  if (error) throw error;

  const ids = (data ?? []).map(r => r.user_id);
  console.log(`Stale/missing embeddings: ${ids.length}`);

  for (const group of chunk(ids, 20)) {
    await Promise.all(
      group.map(async (id) => {
        try {
          const res = await fetch(`${origin}/api/embeddings/upsert`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: id }),
          });
          if (!res.ok) {
            console.error(`[${id}] -> ${res.status}`, await res.text());
          } else {
            console.log(`Refreshed ${id}`);
          }
        } catch (e) {
          console.error(`Failed ${id}:`, e?.message || e);
        }
      })
    );
  }
  console.log("Done.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
