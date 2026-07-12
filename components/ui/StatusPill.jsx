import { cn } from "@/lib/cn";
import { meta } from "@/lib/statuses";

// Colours for each "tone". Muted, in keeping with the near-monochrome look.
const tones = {
  neutral: "text-black/55 bg-black/[0.04] border-black/[0.07]",
  success: "text-emerald-700 bg-emerald-500/10 border-emerald-600/15",
  info: "text-sky-700 bg-sky-500/10 border-sky-600/15",
  warn: "text-amber-700 bg-amber-500/10 border-amber-600/15",
  danger: "text-red-700 bg-red-500/10 border-red-600/15",
};

// Pass EITHER an explicit { label, tone } via props, OR a `map` + `value`
// pair (e.g. map={ASSET_STATUS} value={asset.status}) to look it up.
export default function StatusPill({
  label,
  tone = "neutral",
  map,
  value,
  dot = false,
  pulse = false,
  className,
}) {
  if (map && value) {
    const m = meta(map, value);
    label = m.label;
    tone = m.tone;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] tracking-wide whitespace-nowrap",
        tones[tone],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current",
            pulse && "animate-live"
          )}
        />
      )}
      {label}
    </span>
  );
}
