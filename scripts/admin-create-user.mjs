import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) throw new Error("Missing env");

const email = process.argv[2] || "test@example.com";
const password = process.argv[3] || "Passw0rd!";

const supabase = createClient(url, service);

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (error) throw error;

const user = data.user;
console.log("Created auth user:", user.id, user.email);

// mirror into public.users if needed
const { error: upsertErr } = await supabase.from("users").upsert({
  id: user.id,
  email: user.email,
  username: user.email?.split("@")[0] ?? "user",
  premium: false,
});
if (upsertErr) throw upsertErr;

console.log("Upserted into public.users");
