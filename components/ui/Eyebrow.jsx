import { cn } from "@/lib/cn";

// The little tracked-out uppercase pill label that opens sections.
export default function Eyebrow({ children, className }) {
  return <span className={cn("eyebrow", className)}>{children}</span>;
}
