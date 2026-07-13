// DESIGN.md §5.8 — full-bleed skills/tags band: two rows of pill tags scrolling
// horizontally on an infinite loop (content duplicated for a seamless loop).

const ROW_A = [
  "Laptops", "Vehicles", "Meeting Rooms", "Projectors", "Furniture", "Forklifts",
  "Serial Numbers", "QR Tracking", "Asset Tags", "Warranty Tracking",
];
const ROW_B = [
  "Allocation", "Transfers", "Booking Calendar", "Overlap Checks", "Maintenance",
  "Audit Cycles", "Discrepancy Reports", "Overdue Alerts", "Utilization", "Role-Based Access",
];

function Pill({ children }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-black/[0.08] bg-white/50 px-4 py-2 text-sm text-black/55">
      {children}
    </span>
  );
}

function Row({ items, duration, reverse }) {
  return (
    <div className="flex overflow-hidden">
      <div
        className="flex w-max shrink-0 items-center gap-3 pr-3 animate-marquee"
        style={{ "--marquee-duration": `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {/* duplicated back-to-back so translateX(-50%) loops seamlessly */}
        {[...items, ...items].map((t, i) => (
          <Pill key={i}>{t}</Pill>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section
      aria-hidden="true"
      className="relative border-t border-black/[0.06] py-10"
    >
      <div className="flex flex-col gap-3">
        <Row items={ROW_A} duration={44} />
        <Row items={ROW_B} duration={54} reverse />
      </div>
      {/* soft edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </section>
  );
}
