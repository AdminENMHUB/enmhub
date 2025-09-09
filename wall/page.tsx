// src/app/wall/page.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function WallPage() {
  const supabase = getSupabaseServer();
  const { data } = await supabase.from("posts")
    .select("id, author_id, body, is_nsfw, visibility, created_at")
    .eq("visibility","public")
    .order("created_at", { ascending: false })
    .limit(50);

  async function createPost(formData: FormData) {
    "use server";
    const text = String(formData.get("text") ?? "");
    const is_nsfw = formData.get("is_nsfw") === "on";
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/posts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, is_nsfw, visibility: "public" })
    });
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Public Wall</h1>

      <form action={createPost} className="space-y-3">
        <textarea name="text" rows={3} placeholder="Say something…" className="w-full border rounded p-3" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_nsfw" defaultChecked />
          NSFW
        </label>
        <button className="px-3 py-2 rounded bg-zinc-900 text-white">Post</button>
      </form>

      <ul className="space-y-4">
        {(data ?? []).map((p) => (
          <li key={p.id} className="border rounded p-4">
            <div className="text-sm text-zinc-500">{new Date(p.created_at!).toLocaleString()}</div>
            <div className="mt-2 whitespace-pre-wrap">{p.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
