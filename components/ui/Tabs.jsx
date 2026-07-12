"use client";

import { cn } from "@/lib/cn";

// Simple controlled tab strip.
//   <Tabs tabs={[{id, label}]} active={id} onChange={setId} />
export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-control border border-black/[0.08] bg-white/60 p-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-[10px] px-4 py-1.5 text-xs tracking-wide transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-black/55 hover:text-foreground hover:bg-black/[0.04]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
