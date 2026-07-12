// Central place that maps every status value to a human label + a "tone".
// StatusPill turns a tone into colours. Keeps colour usage consistent.

// Asset lifecycle (from the problem statement).
export const ASSET_STATUS = {
  AVAILABLE: { label: "Available", tone: "success" },
  ALLOCATED: { label: "Allocated", tone: "info" },
  RESERVED: { label: "Reserved", tone: "warn" },
  UNDER_MAINTENANCE: { label: "Under Maintenance", tone: "warn" },
  LOST: { label: "Lost", tone: "danger" },
  RETIRED: { label: "Retired", tone: "neutral" },
  DISPOSED: { label: "Disposed", tone: "neutral" },
};

// The order assets move through / are listed in filters.
export const ASSET_STATUS_ORDER = [
  "AVAILABLE",
  "ALLOCATED",
  "RESERVED",
  "UNDER_MAINTENANCE",
  "LOST",
  "RETIRED",
  "DISPOSED",
];

export const BOOKING_STATUS = {
  UPCOMING: { label: "Upcoming", tone: "info" },
  ONGOING: { label: "Ongoing", tone: "success" },
  COMPLETED: { label: "Completed", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
};

export const MAINTENANCE_STATUS = {
  PENDING: { label: "Pending", tone: "warn" },
  APPROVED: { label: "Approved", tone: "info" },
  REJECTED: { label: "Rejected", tone: "danger" },
  TECHNICIAN_ASSIGNED: { label: "Technician Assigned", tone: "info" },
  IN_PROGRESS: { label: "In Progress", tone: "warn" },
  RESOLVED: { label: "Resolved", tone: "success" },
};

export const TRANSFER_STATUS = {
  REQUESTED: { label: "Requested", tone: "warn" },
  APPROVED: { label: "Approved", tone: "info" },
  REJECTED: { label: "Rejected", tone: "danger" },
  REALLOCATED: { label: "Re-allocated", tone: "success" },
};

export const PRIORITY = {
  LOW: { label: "Low", tone: "neutral" },
  MEDIUM: { label: "Medium", tone: "info" },
  HIGH: { label: "High", tone: "warn" },
  CRITICAL: { label: "Critical", tone: "danger" },
};

export const AUDIT_ITEM_STATUS = {
  PENDING: { label: "Pending", tone: "neutral" },
  VERIFIED: { label: "Verified", tone: "success" },
  MISSING: { label: "Missing", tone: "danger" },
  DAMAGED: { label: "Damaged", tone: "warn" },
};

export const AUDIT_CYCLE_STATUS = {
  OPEN: { label: "Open", tone: "success" },
  CLOSED: { label: "Closed", tone: "neutral" },
};

// Generic lookup helper: meta(ASSET_STATUS, value)
export function meta(map, value) {
  return map[value] || { label: value, tone: "neutral" };
}
