"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, UserCog } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/lib/currentUser";
import { ROLE_LABELS } from "@/lib/roles";
import { initials } from "@/lib/format";

// DEMO-ONLY control: swap which mock user you're "logged in" as, to preview
// each role's view. This disappears in Phase 3 once real auth exists.
export default function RoleSwitcher() {
  const { user, selectUser, allUsers } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-control border border-black/10 bg-white/60 py-1.5 pl-1.5 pr-2.5 transition-all duration-200 hover:border-black/20"
        title="Switch demo role"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
          {initials(user.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-xs leading-tight text-foreground">{user.name}</span>
          <span className="block text-[10px] uppercase tracking-widest text-black/40">
            {ROLE_LABELS[user.role]}
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-black/40" strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-card border border-black/10 bg-card p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-2 px-2.5 py-2 text-[11px] uppercase tracking-widest text-black/40">
            <UserCog className="h-3.5 w-3.5" strokeWidth={1.5} />
            View as (demo)
          </div>
          <div className="max-h-80 overflow-y-auto">
            {allUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  selectUser(u.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-[10px] px-2.5 py-2 text-left transition-colors hover:bg-black/[0.04]",
                  u.id === user.id && "bg-black/[0.03]"
                )}
              >
                <span>
                  <span className="block text-sm text-foreground">{u.name}</span>
                  <span className="block text-xs text-black/45">
                    {ROLE_LABELS[u.role]}
                  </span>
                </span>
                {u.id === user.id && (
                  <Check className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
