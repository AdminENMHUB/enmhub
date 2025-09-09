"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function AgePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  async function accept() {
    await fetch("/api/age/accept", { method: "POST" });
    router.replace(next);
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-bold">Adults Only (18+)</h1>
      <p>By continuing you confirm you are 18+ and agree to our terms.</p>
      <button className="rounded bg-black text-white px-4 py-2" onClick={accept}>
        I am 18 or older – Continue
      </button>
    </main>
  );
}
