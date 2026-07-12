import Link from "next/link";
import { cn } from "@/lib/cn";

// Two visual variants (outline + filled) reused everywhere, plus a quiet ghost.
// Renders as a <Link> when `href` is given, otherwise a <button>.

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-normal uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap select-none";

const sizes = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-5 py-2.5 text-xs",
  block: "w-full px-4 py-3 text-xs",
};

const variants = {
  outline:
    "border border-black/10 text-black/60 hover:border-black/25 hover:text-foreground hover:bg-black/[0.03]",
  filled:
    "border border-transparent bg-primary text-primary-foreground hover:bg-primary-hover",
  ghost: "text-black/55 hover:text-foreground hover:bg-black/[0.04]",
  danger:
    "border border-red-600/20 text-red-700 hover:bg-red-500/10 hover:border-red-600/30",
};

export default function Button({
  href,
  variant = "outline",
  size = "sm",
  className,
  children,
  ...props
}) {
  const classes = cn(base, sizes[size], variants[variant], className);
  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
