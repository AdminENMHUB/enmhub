// src/app/page.tsx
import Link from "next/link";
import type { Route } from "next"; // <-- correct source
import Matching from "../components/Matching";

export default function Home() {
  const demoUserId = "20c8b61e-d8f1-4662-aa83-67fd3e3027d5";

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_50%_0%,#4f46e5_0%,transparent_60%),radial-gradient(40%_50%_at_20%_100%,#06b6d4_0%,transparent_60%)] opacity-25"
        />
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">ENM Hub</h1>
            <p className="mt-4 text-lg md:text-xl opacity-80">
              Ethical, private, and smart matching for ENM & swinger communities.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href={"/signup" as Route} className="px-4 py-2 rounded bg-indigo-600 text-white">
                Get Started
              </Link>
              <Link href={"/safety" as Route} className="px-4 py-2 rounded border">
                Safety & Consent
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-2xl font-semibold mb-4">Suggested Matches</h2>
        <Matching userId={demoUserId} />
      </section>
    </main>
  );
}
