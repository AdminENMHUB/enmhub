// src/components/ModerationButtons.tsx
"use client";

export function ReportButton(props: { target_kind: "post"|"photo"|"profile"; target_id: string }) {
  async function onReport() {
    const reason = prompt("Why are you reporting this?");
    if (!reason) return;
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...props, reason })
    });
    alert(res.ok ? "Reported" : `Error: ${await res.text()}`);
  }
  return <button onClick={onReport} className="text-xs text-red-600 underline">Report</button>;
}

export function BlockButton(props: { blockee_id: string }) {
  async function onBlock() {
    if (!confirm("Block this user?")) return;
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(props)
    });
    alert(res.ok ? "Blocked" : `Error: ${await res.text()}`);
  }
  return <button onClick={onBlock} className="text-xs text-zinc-600 underline">Block</button>;
}
