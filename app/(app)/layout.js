import AppShell from "@/components/shell/AppShell";

// Layout for every authenticated screen (dashboard, assets, bookings, ...).
export default function AppGroupLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
