import Link from "next/link";
import { ShieldCheck, Boxes, CalendarClock } from "lucide-react";
import PixelGlyph from "@/components/motion/PixelGlyph";

// Two-panel auth shell: brand story on the left, form (children) on the right.
export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between border-r border-black/[0.06] bg-background px-12 py-10 lg:flex">
        <Link href="/" className="font-logo text-xs tracking-[0.25em] text-black/70">
          ASSETFLOW
        </Link>

        <div className="max-w-md">
          <PixelGlyph seed="assetflow-auth" size={44} />
          <h1 className="mt-6 font-display text-4xl font-light leading-tight tracking-tight text-foreground">
            Track, allocate, and maintain every asset — in one place.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-black/45">
            A centralized platform for departments, employees, assets, bookings,
            maintenance, and audits — with clean role-based workflows.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-black/55">
            <li className="flex items-center gap-3">
              <Boxes className="h-4 w-4 text-black/35" strokeWidth={1.5} />
              Full asset lifecycle & allocation tracking
            </li>
            <li className="flex items-center gap-3">
              <CalendarClock className="h-4 w-4 text-black/35" strokeWidth={1.5} />
              Conflict-free resource booking
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-black/35" strokeWidth={1.5} />
              Secure, role-based approval workflows
            </li>
          </ul>
        </div>

        <p className="text-[11px] uppercase tracking-widest text-black/30">
          Enterprise Asset &amp; Resource Management
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 inline-block font-logo text-xs tracking-[0.25em] text-black/70 lg:hidden"
          >
            ASSETFLOW
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
