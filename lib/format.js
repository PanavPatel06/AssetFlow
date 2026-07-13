// Small formatting + date helpers shared across screens.

// Reference "now". Real data is live and persistent (Phase 3+), so this must
// track the actual current time rather than a fixed demo date.
export const NOW = new Date();

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCurrency(amount) {
  if (amount == null) return "—";
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// Whole-day difference from NOW (negative = in the past).
export function daysFromNow(value) {
  const d = new Date(value);
  return Math.round((d - NOW) / (1000 * 60 * 60 * 24));
}

export function isOverdue(expectedReturnDate) {
  if (!expectedReturnDate) return false;
  return new Date(expectedReturnDate) < NOW;
}

// "in 3 days" / "2 days ago" / "today"
export function relativeDays(value) {
  const n = daysFromNow(value);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n === -1) return "yesterday";
  if (n > 0) return `in ${n} days`;
  return `${Math.abs(n)} days ago`;
}

// "2h ago" style for activity feeds.
export function timeAgo(value) {
  const diffMs = NOW - new Date(value);
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
