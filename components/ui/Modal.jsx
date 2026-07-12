"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

// Centered dialog with a translucent backdrop. Controlled via `open`/`onClose`.
export default function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 my-auto w-full rounded-card border border-black/10 bg-card shadow-[0_20px_60px_rgba(0,0,0,0.12)]",
          widths[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-6 py-4">
          <div>
            {title && <h3 className="text-lg font-light text-foreground">{title}</h3>}
            {description && <p className="mt-0.5 text-sm text-black/45">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-black/40 transition-colors hover:bg-black/[0.05] hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
