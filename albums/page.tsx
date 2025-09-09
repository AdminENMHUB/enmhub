// src/app/albums/page.tsx
import React from "react";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";
import AlbumUploadBox from "@/components/AlbumUploadBox"; // NEW wrapper (client) that feeds props to AlbumUploader

type Album = {
  id: string;
  title: string;
  is_private: boolean;
  is_nsfw: boolean;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function AlbumsPage() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Your albums</h1>
        <div className="rounded-lg border p-6">
          <p className="mb-4">You need to be signed in to manage albums.</p>
          <Link
            href="/login"
            className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  // Server Action to create a new album
  async function createAlbum(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    const is_private = formData.get("is_private") === "on";
    const is_nsfw = formData.get("is_nsfw") === "on";

    if (!title) {
      throw new Error("Album title is required.");
    }

    const supabase = await getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("albums")
      .insert({ owner_id: user.id, title, is_private, is_nsfw });

    if (error) {
      throw new Error(error.message);
    }
    revalidatePath("/albums");
  }

  // Fetch albums for current user
  const { data: albums, error } = await supabase
    .from("albums")
    .select("id, title, is_private, is_nsfw, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your albums</h1>
        <Link
          href="/"
          className="inline-flex items-center rounded-md border px-3 py-2 hover:bg-gray-50"
        >
          Home
        </Link>
      </header>

      {/* Create album */}
      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-medium mb-3">Create a new album</h2>
        <form action={createAlbum} className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="block text-sm mb-1">Title</span>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Beach weekend"
              className="w-full rounded-md border px-3 py-2"
            />
          </label>

          <label className="flex items-center gap-2">
            <input name="is_private" type="checkbox" defaultChecked />
            <span>Private (locked)</span>
          </label>

          <label className="flex items-center gap-2">
            <input name="is_nsfw" type="checkbox" defaultChecked />
            <span>NSFW</span>
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-gray-50"
            >
              Create album
            </button>
          </div>
        </form>
      </section>

      {/* Upload media (client wrapper ensures AlbumUploader gets albumId + ownerId props) */}
      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-medium mb-3">Upload media</h2>
        <p className="text-sm text-gray-600 mb-4">
          Pick an album and upload images/videos. You can toggle NSFW per item later.
        </p>
        <AlbumUploadBox ownerId={user.id} albums={(albums ?? []).map(a => ({ id: a.id, title: a.title }))} />
      </section>

      {/* List albums */}
      <section className="rounded-lg border p-5">
        <h2 className="text-lg font-medium mb-4">Albums</h2>

        {error ? (
          <div className="rounded-md border border-red-300 bg-red-50 p-4">
            <p className="text-red-700">
              Failed to load albums: {error.message}
            </p>
          </div>
        ) : !albums || albums.length === 0 ? (
          <p className="text-gray-600">No albums yet. Create your first one above.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a: Album) => (
              <li key={a.id} className="rounded-md border p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium truncate">{a.title}</h3>
                  <span className="text-xs rounded-full border px-2 py-0.5">
                    {a.is_private ? "Private" : "Public"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  {a.is_nsfw ? "NSFW" : "SFW"} •{" "}
                  {new Date(a.created_at).toLocaleString()}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/albums/${a.id}`}
                    className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
