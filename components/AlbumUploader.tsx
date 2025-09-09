"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(url, anon);

type Props = { albumId: string; ownerId: string };

export default function AlbumUploader({ albumId, ownerId }: Props) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onUpload() {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    setOk(null);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Only images and videos are allowed.");
        setBusy(false);
        return;
      }
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `albums/${ownerId}/${albumId}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (upErr) {
        setError(upErr.message);
        setBusy(false);
        return;
      }

      // Save metadata row
      const res = await fetch("/api/albums/photos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          album_id: albumId,
          storage_path: path,
          mime_type: file.type,
          is_nsfw: true
        }),
      });
      if (!res.ok) {
        setError(`DB row insert failed: ${await res.text()}`);
        setBusy(false);
        return;
      }
    }

    setBusy(false);
    setOk("Uploaded!");
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => setFiles(e.target.files)}
      />
      <button
        className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        onClick={onUpload}
        disabled={busy || !files || files.length === 0}
      >
        {busy ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {ok && <p className="text-green-600 text-sm">{ok}</p>}
    </div>
  );
}
