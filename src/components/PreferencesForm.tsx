// src/components/PreferencesForm.tsx
"use client";
import { useState } from "react";

const PLAY_PREFS = [
  "same_room","different_rooms","hard_swap","soft_swap",
  "watch_only","be_watched_only","parallel_touching",
  "same_bed","different_bed","hotwife","cuckold","cuckquean",
  "stag_vixen","protected_play","bare_sex","cream_pie","cum_play","bdsm",
] as const;

const SEEKING = ["mf","f","m","group","multiple_males","ff"] as const;
const EXPERIENCE = ["new","mild","very"] as const;
const PROFILE_ROLE = ["m","f","mf","ff","mm","group"] as const;

type State = {
  profile_role: string;
  play_prefs: string[];
  seeking: string[];
  experience: string;
  min_age: number | null;
  max_age: number | null;
  geo_mode: "current" | "custom";
  custom_lat: number | null;
  custom_lng: number | null;
  custom_city: string;
  custom_state: string;
  custom_zip: string;
  hide_local: boolean;
  hide_radius_mi: number; // MILES
  allow_ai_aesthetic: boolean;
  public_visibility: boolean;
};

export default function PreferencesForm() {
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<State>({
    profile_role: "mf",
    play_prefs: [],
    seeking: [],
    experience: "new",
    min_age: 21,
    max_age: 65,
    geo_mode: "current",
    custom_lat: null,
    custom_lng: null,
    custom_city: "",
    custom_state: "",
    custom_zip: "",
    hide_local: false,
    hide_radius_mi: 0, // miles
    allow_ai_aesthetic: false,
    public_visibility: true,
  });

  const toggleArr = (key: "play_prefs" | "seeking", val: string) => {
    setState((s) => {
      const has = s[key].includes(val);
      const next = has ? s[key].filter((v) => v !== val) : [...s[key], val];
      return { ...s, [key]: next };
    });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const p = await res.json();
      if (!res.ok) throw new Error(p?.error || "Save failed");
      alert("Saved!");
    } catch (err: any) {
      alert(err.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium mb-1">Profile Role</div>
          <select
            className="w-full border rounded p-2"
            value={state.profile_role}
            onChange={(e) => setState((s) => ({ ...s, profile_role: e.target.value }))}
          >
            {PROFILE_ROLE.map((r) => (
              <option key={r} value={r}>
                {r.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <div className="text-sm font-medium mb-1">Experience</div>
          <select
            className="w-full border rounded p-2"
            value={state.experience}
            onChange={(e) => setState((s) => ({ ...s, experience: e.target.value }))}
          >
            {EXPERIENCE.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <div className="text-sm font-medium mb-1">Min Age</div>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={state.min_age ?? ""}
            onChange={(e) =>
              setState((s) => ({ ...s, min_age: e.target.value ? Number(e.target.value) : null }))
            }
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium mb-1">Max Age</div>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={state.max_age ?? ""}
            onChange={(e) =>
              setState((s) => ({ ...s, max_age: e.target.value ? Number(e.target.value) : null }))
            }
          />
        </label>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Play Preferences</div>
        <div className="flex flex-wrap gap-2">
          {PLAY_PREFS.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => toggleArr("play_prefs", p)}
              className={`px-3 py-1 rounded border ${
                state.play_prefs.includes(p) ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {p.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Seeking</div>
        <div className="flex flex-wrap gap-2">
          {SEEKING.map((sv) => (
            <button
              type="button"
              key={sv}
              onClick={() => toggleArr("seeking", sv)}
              className={`px-3 py-1 rounded border ${
                state.seeking.includes(sv) ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {sv.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.public_visibility}
            onChange={(e) => setState((s) => ({ ...s, public_visibility: e.target.checked }))}
          />
          <span>Publicly Discoverable</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.allow_ai_aesthetic}
            onChange={(e) => setState((s) => ({ ...s, allow_ai_aesthetic: e.target.checked }))}
          />
          <span>Opt-in AI Aesthetic Tie-Breaker</span>
        </label>
      </div>

      <div className="border rounded p-4 space-y-3">
        <div className="font-medium">Location & Privacy</div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="geo_mode"
              checked={state.geo_mode === "current"}
              onChange={() => setState((s) => ({ ...s, geo_mode: "current" }))}
            />
            <span>Use current location</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="geo_mode"
              checked={state.geo_mode === "custom"}
              onChange={() => setState((s) => ({ ...s, geo_mode: "custom" }))}
            />
            <span>Use custom location</span>
          </label>
        </div>
        {state.geo_mode === "custom" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="border rounded p-2"
              placeholder="Custom lat"
              value={state.custom_lat ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, custom_lat: e.target.value ? Number(e.target.value) : null }))
              }
            />
            <input
              className="border rounded p-2"
              placeholder="Custom lng"
              value={state.custom_lng ?? ""}
              onChange={(e) =>
                setState((s) => ({ ...s, custom_lng: e.target.value ? Number(e.target.value) : null }))
              }
            />
            <input
              className="border rounded p-2"
              placeholder="City"
              value={state.custom_city}
              onChange={(e) => setState((s) => ({ ...s, custom_city: e.target.value }))}
            />
            <input
              className="border rounded p-2"
              placeholder="State"
              value={state.custom_state}
              onChange={(e) => setState((s) => ({ ...s, custom_state: e.target.value }))}
            />
            <input
              className="border rounded p-2"
              placeholder="ZIP"
              value={state.custom_zip}
              onChange={(e) => setState((s) => ({ ...s, custom_zip: e.target.value }))}
            />
          </div>
        )}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.hide_local}
            onChange={(e) => setState((s) => ({ ...s, hide_local: e.target.checked }))}
          />
          <span>Hide from local searches</span>
        </label>
        <label className="block">
          <div className="text-sm mb-1">Hide radius (miles)</div>
          <input
            type="number"
            className="border rounded p-2 w-40"
            value={state.hide_radius_mi}
            onChange={(e) => setState((s) => ({ ...s, hide_radius_mi: Number(e.target.value) }))}
          />
        </label>
      </div>

      <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </form>
  );
}
