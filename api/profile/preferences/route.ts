// src/app/api/profile/preferences/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";

export const runtime = "nodejs";

const PlayPref = z.enum([
  "same_room","different_rooms","hard_swap","soft_swap",
  "watch_only","be_watched_only","parallel_touching",
  "same_bed","different_bed","hotwife","cuckold","cuckquean",
  "stag_vixen","protected_play","bare_sex","cream_pie","cum_play","bdsm",
]);
const Seeking = z.enum(["mf","f","m","group","multiple_males","ff"]);
const Experience = z.enum(["new","mild","very"]);
const ProfileRole = z.enum(["m","f","mf","ff","mm","group"]);

const Body = z.object({
  profile_role: ProfileRole,
  play_prefs: z.array(PlayPref).default([]),
  seeking: z.array(Seeking).default([]),
  experience: Experience.default("new"),
  min_age: z.number().int().min(18).max(120).nullable().optional(),
  max_age: z.number().int().min(18).max(120).nullable().optional(),
  geo_mode: z.enum(["current","custom"]).default("current"),
  custom_lat: z.number().nullable().optional(),
  custom_lng: z.number().nullable().optional(),
  custom_city: z.string().nullable().optional(),
  custom_state: z.string().nullable().optional(),
  custom_zip: z.string().nullable().optional(),
  hide_local: z.boolean().default(false),
  hide_radius_mi: z.number().int().min(0).max(1000).default(0), // MILES
  allow_ai_aesthetic: z.boolean().default(false),
  public_visibility: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user }, error: uerr } = await supabase.auth.getUser();
    if (uerr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const input = Body.parse(await req.json());

    // Ensure profile role exists for matching
    {
      const { error } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, profile_role: input.profile_role }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
    }

    // Preferences
    {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          play_prefs: input.play_prefs,
          seeking: input.seeking,
          experience: input.experience,
          min_age: input.min_age ?? null,
          max_age: input.max_age ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
    }

    // Settings (now uses miles)
    {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          geo_mode: input.geo_mode,
          custom_lat: input.custom_lat ?? null,
          custom_lng: input.custom_lng ?? null,
          custom_city: input.custom_city ?? null,
          custom_state: input.custom_state ?? null,
          custom_zip: input.custom_zip ?? null,
          hide_local: input.hide_local,
          hide_radius_mi: input.hide_radius_mi, // miles
          allow_ai_aesthetic: input.allow_ai_aesthetic,
          public_visibility: input.public_visibility,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 400 });
  }
}
