"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "@/components/icons";
import { cn } from "@/lib/cn";
import { navForRole } from "@/lib/nav";
import { useCurrentUser } from "@/lib/currentUser";
import { ROLE_LABELS } from "@/lib/roles";

export default function Sidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const items = navForRole(user.role);

  const content = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 pb-6 pt-6">
        <Link href="/dashboard" className="font-logo text-xs tracking-[0.25em] text-black/70">
          ASSETFLOW
        </Link>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-black/40 hover:text-foreground lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-control px-3 py-2 text-sm transition-all duration-200",
                active
                  ? "bg-black/[0.05] text-foreground"
                  : "text-black/55 hover:bg-black/[0.03] hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Current role footer */}
      <div className="mt-4 border-t border-black/[0.06] px-6 py-4">
        <div className="text-[11px] uppercase tracking-widest text-black/35">
          Signed in as
        </div>
        <div className="mt-1 text-sm text-foreground">{user.name}</div>
        <div className="text-xs text-black/45">{ROLE_LABELS[user.role]}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed rail */}
      <aside className="hidden w-64 shrink-0 border-r border-black/[0.06] bg-background lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      {/* Mobile: slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/25" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-black/10 bg-background">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
