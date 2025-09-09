// src/components/AdvancedMatches.tsx
"use client";
import { useEffect, useState } from "react";
import ReasonPills from "./ReasonPills";

type Candidate = {
  user: { id: string; username: string; email: string };
  similarity: number;
  score: number;
  components: any;
  distance_mi: number | null;
  embedding_updated_at: string;
};

export default function AdvancedMatches({ userId, maxMiles = 300, k = 12 }:{
  userId: string;
  maxMiles?: number | null;
  k?: number;
}) {
  const [items, setItems] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let done = false;
    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ user_id: userId, k: String(k) });
        if (maxMiles != null) params.set("max_miles", String(maxMiles));
        const res = await fetch(`/api/match/recommendations/advanced?${params.toString()}`);
        const p = await res.json();
        if (!res.ok) throw new Error(p?.error || "Failed");
        if (!done) setItems(p.candidates || []);
      } catch (e: any) {
        if (!done) setErr(e?.message || "Error");
      } finally {
        if (!done) setLoading(false);
      }
    })();
    return () => { done = true; };
  }, [userId, maxMiles, k]);

  if (loading) return <div className="text-sm text-zinc-500">Loading matches…</div>;
  if (err) return <div className="text-sm text-red-600">{err}</div>;
  if (!items.length) return <div className="text-sm text-zinc-500">No matches yet. Update your preferences.</div>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((c) => (
        <div key={c.user.id} className="border rounded-xl p-4 space-y-2">
          <div className="font-semibold">{c.user.username || c.user.email}</div>
          <ReasonPills components={c.components} />
          <div className="text-xs text-zinc-500">
            Score {(c.score*100).toFixed(0)} •
            Sim {(c.similarity*100).toFixed(0)} •
            {c.distance_mi != null ? ` ~${c.distance_mi.toFixed(0)} mi` : " distance N/A"}
          </div>
        </div>
      ))}
    </div>
  );
}
