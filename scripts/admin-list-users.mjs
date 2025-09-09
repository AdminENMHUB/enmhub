import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) throw new Error("Missing env");

const supabase = createClient(url, service);

const { data, error } = await supabase.auth.admin.listUsers();
if (error) throw error;

for (const u of data.users) {
  console.log(`${u.id}  ${u.email}  created_at=${u.created_at}`);
}
