"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "@/components/icons";
import Button from "@/components/ui/Button";

const LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Roles", href: "#roles" },
  { label: "Workflow", href: "#workflow" },
];

// Fixed, floating glass pill — 768px max width, per DESIGN1.md §4/§6 exactly.
// (Two CTAs instead of the source's single button is a deliberate adaptation:
// AssetFlow needs both a sign-in and a sign-up path, not just a capture form.)
export default function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="w-full max-w-3xl rounded-2xl border border-black/[0.06] bg-background/30 px-4 py-3 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-logo text-xs tracking-[0.25em] text-black/70">
            ASSETFLOW
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[11px] tracking-wide text-black/60 transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button href="/login" variant="ghost">Sign in</Button>
            <Button href="/signup" variant="filled">Get started</Button>
          </div>

          <button
            className="rounded-md p-1.5 text-black/60 hover:text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mt-3 flex flex-col gap-1 border-t border-black/[0.06] pt-3 md:hidden">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-control px-3 py-2 text-sm text-black/60 hover:bg-black/[0.03] hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <Button href="/login" variant="outline" className="flex-1">Sign in</Button>
              <Button href="/signup" variant="filled" className="flex-1">Get started</Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
