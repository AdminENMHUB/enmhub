// src/components/AlbumUploadBox.tsx
"use client";

import React from "react";
import AlbumUploader from "@/components/AlbumUploader";

type Props = {
  ownerId: string;
  albums: { id: string; title: string }[];
};

/**
 * Small client wrapper that:
 *  - lets the user pick an album,
 *  - passes required props { albumId, ownerId } to AlbumUploader.
 */
export default function AlbumUploadBox({ ownerId, albums }: Props) {
  const [albumId, setAlbumId] = React.useState<string>(
    albums.length ? albums[0].id : ""
  );

  if (!albums.length) {
    return (
      <div className="rounded-md border p-4 text-sm text-gray-600">
        Create an album above to start uploading.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="block text-sm mb-1">Upload to album</span>
        <select
          value={albumId}
          onChange={(e) => setAlbumId(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
        >
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </label>

      {/* IMPORTANT: AlbumUploader requires { albumId, ownerId } */}
      <AlbumUploader albumId={albumId} ownerId={ownerId} />
    </div>
  );
}
