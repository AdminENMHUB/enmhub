// src/app/albums/[albumId]/page.tsx
import { Metadata } from "next";
import supabaseServer from "@/lib/supabaseServer"; // your server helper using @supabase/ssr
import Link from "next/link";

type PageProps = {
  params: { albumId: string };
};

export const metadata: Metadata = {
  title: "Album",
};

export default async function AlbumPage({ params }: PageProps) {
  const { albumId } = params;

  // Example: fetch the album and its photos (adjust table/column names to your schema)
  const supabase = await supabaseServer();
  const { data: album, error: albumErr } = await supabase
    .from("albums")
    .select("id,title,visibility,created_at,owner_id")
    .eq("id", albumId)
    .single();

  if (albumErr) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Album</h1>
        <p className="text-red-600">Error loading album: {albumErr.message}</p>
        <Link className="text-blue-600 underline" href="/albums">Back</Link>
      </div>
    );
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("id,album_id,public_url,is_nsfw,created_at")
    .eq("album_id", albumId)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{album.title}</h1>
        <Link className="text-blue-600 underline" href="/albums">All albums</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {(photos ?? []).map((p) => (
          <figure key={p.id} className="rounded-xl overflow-hidden border">
            {/* Adjust if you are proxying images through Next/Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src={p.public_url} className="w-full h-40 object-cover" />
            <figcaption className="text-xs p-2 flex justify-between">
              <span>{p.is_nsfw ? "NSFW" : "SFW"}</span>
              <span>{new Date(p.created_at).toLocaleDateString()}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
