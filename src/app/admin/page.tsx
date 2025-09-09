// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [key, setKey] = useState<string>("");
  const [reports, setReports] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const k = sessionStorage.getItem("admin_key") || "";
    setKey(k);
    if (k) refresh(k);
  }, []);

  async function refresh(k: string) {
    setLoaded(false);
    const [r1, r2] = await Promise.all([
      fetch("/api/admin/reports", { headers: { "x-admin-key": k } }),
      fetch("/api/admin/album-access", { headers: { "x-admin-key": k } })
    ]);
    const j1 = await r1.json(); const j2 = await r2.json();
    if (r1.ok) setReports(j1.reports); else alert(j1.error || "reports error");
    if (r2.ok) setRequests(j2.requests); else alert(j2.error || "album-access error");
    setLoaded(true);
  }

  function saveKey() {
    sessionStorage.setItem("admin_key", key);
    refresh(key);
  }

  async function setReportStatus(id: string, status: string) {
    const r = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ id, status }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Failed");
    refresh(key);
  }

  async function hide(target_type: "post"|"photo", target_id: string, hidden: boolean) {
    const r = await fetch("/api/admin/hide", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ target_type, target_id, hidden }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Failed");
    refresh(key);
  }

  async function decideAccess(album_id: string, grantee_id: string, action: "approve"|"deny") {
    const r = await fetch("/api/admin/album-access", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ album_id, grantee_id, action }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error || "Failed");
    refresh(key);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Admin</h1>
      <div className="p-4 rounded border space-y-3">
        <label className="block text-sm font-medium">Admin Key</label>
        <input className="border rounded px-3 py-2 w-full" value={key} onChange={(e)=>setKey(e.target.value)} />
        <button className="px-4 py-2 rounded bg-black text-white" onClick={saveKey}>Use Key</button>
      </div>

      {loaded && (
        <>
          <div className="p-4 rounded border space-y-3">
            <h2 className="text-xl font-semibold">Open Reports</h2>
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r.id} className="border rounded p-3">
                  <div className="text-sm text-gray-500">{r.created_at}</div>
                  <div className="font-medium">{r.target_type} · {r.target_id}</div>
                  <div className="text-sm">{r.reason}</div>
                  <div className="flex gap-2 mt-2">
                    <button className="px-3 py-1 rounded border" onClick={()=>setReportStatus(r.id,"reviewed")}>Mark reviewed</button>
                    <button className="px-3 py-1 rounded border" onClick={()=>setReportStatus(r.id,"action_taken")}>Mark action taken</button>
                    <button className="px-3 py-1 rounded border" onClick={()=>setReportStatus(r.id,"rejected")}>Reject</button>
                    {r.target_type === "post" && (
                      <>
                        <button className="px-3 py-1 rounded border" onClick={()=>hide("post", r.target_id, true)}>Hide post</button>
                        <button className="px-3 py-1 rounded border" onClick={()=>hide("post", r.target_id, false)}>Unhide post</button>
                      </>
                    )}
                    {r.target_type === "photo" && (
                      <>
                        <button className="px-3 py-1 rounded border" onClick={()=>hide("photo", r.target_id, true)}>Hide photo</button>
                        <button className="px-3 py-1 rounded border" onClick={()=>hide("photo", r.target_id, false)}>Unhide photo</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {reports.length === 0 && <div className="text-sm text-gray-500">No reports.</div>}
            </div>
          </div>

          <div className="p-4 rounded border space-y-3">
            <h2 className="text-xl font-semibold">Album Access Requests</h2>
            <div className="space-y-2">
              {requests.map((x) => (
                <div key={`${x.album_id}-${x.grantee_id}`} className="border rounded p-3">
                  <div className="font-medium">{x.albums?.title ?? x.album_id}</div>
                  <div className="text-sm text-gray-500">
                    Grantee: {x.grantee_id?.slice(0,8)}… · Owner: {x.albums?.owner_id?.slice(0,8)}… · {x.created_at}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="px-3 py-1 rounded border" onClick={()=>decideAccess(x.album_id, x.grantee_id, "approve")}>Approve</button>
                    <button className="px-3 py-1 rounded border" onClick={()=>decideAccess(x.album_id, x.grantee_id, "deny")}>Deny</button>
                  </div>
                </div>
              ))}
              {requests.length === 0 && <div className="text-sm text-gray-500">No requests.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
