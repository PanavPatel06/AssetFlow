"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, Bell, LogOut } from "@/components/icons";
import { useCurrentUser } from "@/lib/currentUser";
import { useNotifications } from "@/lib/notifications";
import { ROLE_LABELS } from "@/lib/roles";
import { initials } from "@/lib/format";

export default function TopBar({ onMenuClick }) {
  const { user } = useCurrentUser();
  const { unreadCount } = useNotifications();

  if (!user) return null;

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
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2 rounded-control border border-black/10 bg-white/60 py-1.5 pl-1.5 pr-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {initials(user.name)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-xs leading-tight text-foreground">{user.name}</span>
            <span className="block text-[10px] uppercase tracking-widest text-black/40">
              {ROLE_LABELS[user.role]}
            </span>
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-control border border-black/10 bg-white/60 p-2 text-black/55 transition-all duration-200 hover:border-black/20 hover:text-foreground"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
