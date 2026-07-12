import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  Building2,
} from "@/components/icons";

// The main app navigation. `roles` (optional) limits who sees the item;
// when omitted, everyone sees it.
export const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Assets", href: "/assets", icon: Boxes },
  { label: "Allocation & Transfer", href: "/allocations", icon: ArrowLeftRight },
  { label: "Bookings", href: "/bookings", icon: CalendarClock },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  {
    label: "Audits",
    href: "/audits",
    icon: ClipboardCheck,
    roles: ["ADMIN", "ASSET_MANAGER"],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  },
  { label: "Activity & Alerts", href: "/activity", icon: Bell },
  {
    label: "Organization",
    href: "/setup",
    icon: Building2,
    roles: ["ADMIN"],
  },
];

export function navForRole(role) {
  return NAV.filter((item) => !item.roles || item.roles.includes(role));
}
