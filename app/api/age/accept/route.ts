import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // 1 year
  res.cookies.set("age_ok", "1", { httpOnly: false, sameSite: "lax", maxAge: 60*60*24*365 });
  return res;
}
