"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

type Props = {
  albumId: string;
  onUploaded?: () => void;
};

export default function PhotoUploader({ albumId, onUploaded }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setBusy(true);

    try {
      if (!/^image\/(jpeg|png|webp|gif|heic)$/i.test(file.type)) {
        throw new Error("Unsupported type. Use jpeg/png/webp/gif/heic");
      }
      if (file.size > 20 * 1024 * 1024) throw new Error("Max size is 20MB");

      const supa = supabaseClient();
      const { data: { user } } = await supa.auth.getUser();
      if (!user) throw new Error("Sign in required");

      const clean = file.name.replace(/[^\w\.\-]+/g, "_").slice(0, 80);
      const path = `${user.id}/albums/${albumId}/${Date.now()}_${clean}`;

      const { error: upErr } = await supa.storage.from("media").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type
      });
      if (upErr) throw upErr;

      // Register in DB
      const res = await fetch(`/api/albums/${albumId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_path: path, mime: file.type })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to register");

      onUploaded?.();
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setBusy(false);
      e.currentTarget.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="cursor-pointer inline-flex items-center rounded bg-black text-white px-3 py-2">
        <input type="file" accept="image/*" className="hidden" onChange={onPick} disabled={busy}/>
        {busy ? "Uploading..." : "Upload photo"}
      </label>
      {err ? <span className="text-red-600 text-sm">{err}</span> : null}
    </div>
  );
}
