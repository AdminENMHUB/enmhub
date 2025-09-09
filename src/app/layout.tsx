import "./globals.css";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ENM Hub — Ethical, Modern, Magical",
  description: "Next-gen ENM & swinger social platform.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const nav = [
    { href: "/", label: "Home/Matches" },
    { href: "/profile", label: "Profile" },
    { href: "/chat", label: "Chat" },
    { href: "/forums", label: "Forums" },
    { href: "/schedule", label: "Schedule" },
    { href: "/education", label: "Education" },
  ] as const;

  return (
    <html lang="en">
      <body className={`${inter.className} bg-page text-white`}>
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/30 border-b border-white/10">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-xl tracking-tight">
                ENM Hub
              </Link>
              <ul className="hidden md:flex items-center gap-4 text-sm">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-pink-300/90 transition">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost">Log in</Link>
              <Link href="/signup" className="btn btn-primary">Sign up</Link>
              <Link href="/albums" className="px-3 py-2">Albums</Link>
              <Link href="/wall" className="px-3 py-2">Wall</Link>

            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="border-t border-white/10 mt-16">
          <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-white/70">
            <div>
              <div className="font-semibold text-white">ENM Hub (18+ only)</div>
              <div className="mt-2">Ethical, consent-forward connections.</div>
            </div>
            <div className="space-y-2">
              <Link href="/safety" className="hover:text-white">Safety</Link>
              <div>• Consent toolkit • Reporting</div>
            </div>
            <div className="space-y-2">
              <Link href="/terms" className="hover:text-white">Terms</Link><br/>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
            </div>
            <div className="space-y-2">
              <Link href="/contact" className="hover:text-white">Contact</Link>
              <div>hello@enmhub.us</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
