// src/components/ReasonPills.tsx
"use client";

type ComponentsLike =
  | Record<string, number>
  | Record<string, string | number | null | undefined>
  | undefined
  | null;

export default function ReasonPills({ components }: { components: ComponentsLike }) {
  if (!components) return null;

  // Safely coerce values to numbers when possible
  const entries: Array<[string, number]> = Object.entries(components)
    .map(([k, v]) => {
      const num =
        typeof v === "number"
          ? v
          : typeof v === "string"
          ? Number(v)
          : NaN;
      return [k, num] as [string, number];
    })
    .filter(([, v]) => Number.isFinite(v) && !Number.isNaN(v))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (!entries.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([k, v]) => (
        <span
          key={k}
          className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
          title={`${k}: ${(v * 100).toFixed(0)}%`}
        >
          {label(k)} {(v * 100).toFixed(0)}%
        </span>
      ))}
    </div>
  );
}

function label(key: string) {
  switch (key) {
    case "embedding":
      return "Similarity";
    case "play_prefs":
      return "Play match";
    case "seeking":
      return "Mutual seeking";
    case "experience":
      return "Exp fit";
    case "age":
      return "Age fit";
    case "geo":
      return "Distance";
    case "aesthetic":
      return "Aesthetic";
    default:
      return key;
  }
}
