import { cn } from "@/lib/cn";

// The base card recipe from DESIGN.md: 16px radius, hairline border, white bg,
// slow 700ms hover transition of border + background.
export default function Card({ className, hover = true, padding = "p-6", children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-card border border-black/[0.07] bg-card transition-all duration-700",
        padding,
        hover && "hover:border-black/15 hover:bg-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
