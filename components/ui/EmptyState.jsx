import { cn } from "@/lib/cn";

// Shown when a list/table has no rows.
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-black/10 bg-card/50 px-6 py-14 text-center",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-card border border-black/10 bg-white/60">
          <Icon className="h-5 w-5 text-black/35" strokeWidth={1.5} />
        </div>
      )}
      <p className="text-base font-light text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-black/45">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
