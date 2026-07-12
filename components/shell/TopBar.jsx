"use client";

import Link from "next/link";
import { Menu, Bell } from "lucide-react";
import RoleSwitcher from "./RoleSwitcher";
import { useCurrentUser } from "@/lib/currentUser";
import { notifications } from "@/lib/mockData";

export default function TopBar({ onMenuClick }) {
  const { user } = useCurrentUser();
  const unread = notifications.filter(
    (n) => n.userId === user.id && !n.read
  ).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-black/[0.06] bg-background/70 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-black/50 hover:bg-black/[0.04] hover:text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <span className="hidden text-sm text-black/45 sm:block">
          Enterprise Asset &amp; Resource Management
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/activity"
          className="relative rounded-control border border-black/10 bg-white/60 p-2 text-black/55 transition-all duration-200 hover:border-black/20 hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
              {unread}
            </span>
          )}
        </Link>
        <RoleSwitcher />
      </div>
    </header>
  );
}
