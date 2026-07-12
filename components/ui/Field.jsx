import { cn } from "@/lib/cn";

// Shared styling for form controls, plus a labelled Field wrapper.

const controlBase =
  "w-full rounded-control border border-black/10 bg-white px-3 py-2 text-sm text-foreground " +
  "placeholder:text-black/30 outline-none transition-all duration-200 " +
  "focus:border-black/30 focus:bg-white disabled:opacity-50";

export function Label({ children, className, ...props }) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-[11px] uppercase tracking-widest text-black/40",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export function Field({ label, hint, children, className }) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && <Label>{label}</Label>}
      {children}
      {hint && <p className="mt-1 text-xs text-black/40">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn(controlBase, className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(controlBase, "min-h-24 resize-y", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn(controlBase, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}
