import { cn } from "@/lib/cn";

// Dashboard stat tile. Per DESIGN1.md's measured type table, in-UI stat
// numbers ("agent-card stat number": Geist, 24px, weight 300, NORMAL
// tracking) are a distinct, smaller, denser token from marketing hero
// numbers (IBM Plex, tight negative tracking) — this is the former.
export default function KpiCard({ label, value, icon: Icon, note, tone, href }) {
  const noteTone = {
    danger: "text-red-700",
    warn: "text-amber-700",
    success: "text-emerald-700",
  }[tone];

  const Wrapper = href ? "a" : "div";

  return (
    <Wrapper
      href={href}
      className={cn(
        "block rounded-card border border-black/[0.07] bg-card p-5 transition-all duration-700",
        "hover:border-black/15 hover:bg-card-hover"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] uppercase tracking-widest text-black/40">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-black/30" strokeWidth={1.5} />}
      </div>
      <div className="mt-3 text-2xl font-light text-foreground">
        {value}
      </div>
      {note && (
        <div className={cn("mt-1 text-xs", noteTone || "text-black/40")}>
          {note}
        </div>
      )}
    </Wrapper>
  );
}
