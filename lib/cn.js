// Tiny className joiner. Filters out falsey values so you can do:
//   cn("base", isActive && "active", className)
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}
