import Link from "next/link";
import {
  Boxes,
  ArrowLeftRight,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "@/components/icons";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Eyebrow from "@/components/ui/Eyebrow";
import BlurInHeading from "@/components/motion/BlurInHeading";
import Reveal from "@/components/motion/Reveal";
import PixelGlyph from "@/components/motion/PixelGlyph";
import LandingNav from "@/components/marketing/LandingNav";

const FEATURES = [
  { icon: Boxes, title: "Asset Lifecycle", body: "Track every asset through seven states — Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed — with full per-asset history." },
  { icon: ArrowLeftRight, title: "Allocation & Transfer", body: "Assign assets to people or departments. Double-allocation is impossible — the system routes a transfer request for approval instead." },
  { icon: CalendarClock, title: "Resource Booking", body: "Book shared rooms, vehicles, and equipment by time slot. Overlapping bookings are rejected automatically." },
  { icon: Wrench, title: "Maintenance Workflow", body: "Route repairs through approval before work begins. Assets flip to Under Maintenance on approval and back when resolved." },
  { icon: ClipboardCheck, title: "Audit Cycles", body: "Run structured verification cycles with assigned auditors and auto-generated discrepancy reports." },
  { icon: BarChart3, title: "Reports & Analytics", body: "Utilization trends, maintenance frequency, department summaries, and a booking heatmap — all exportable." },
];

const ROLES = [
  { name: "Admin", body: "Sets up departments, categories, audit cycles, and promotes employees to higher roles." },
  { name: "Asset Manager", body: "Registers and allocates assets; approves transfers, maintenance, and returns." },
  { name: "Department Head", body: "Views department assets, approves requests, and books resources for the team." },
  { name: "Employee", body: "Views their assets, books resources, raises maintenance, and initiates returns." },
];

const STEPS = [
  { n: "01", title: "Set up your organization", body: "Create departments, asset categories, and the employee directory." },
  { n: "02", title: "Register assets", body: "Add assets with auto-generated tags; they enter the system as Available." },
  { n: "03", title: "Allocate or book", body: "Assign assets to people, or book shared resources by time slot." },
  { n: "04", title: "Maintain & transfer", body: "Route repairs through approval; transfer or return as needs change." },
  { n: "05", title: "Audit & report", body: "Run audit cycles, flag discrepancies, and surface insight in reports." },
];

const STATS = [
  { value: "7", label: "Lifecycle states" },
  { value: "4", label: "Role-based workflows" },
  { value: "10", label: "Integrated modules" },
  { value: "0", label: "Spreadsheets" },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <LandingNav />

      {/* ---------------------------------- Hero --------------------------------- */}
      <section className="relative px-6 pb-24 pt-40 sm:pt-44">
        {/* Ambient iridescent glow */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 left-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-200/40 via-violet-200/25 to-transparent blur-3xl" />
          <div className="absolute top-10 right-1/4 h-[24rem] w-[24rem] translate-x-1/2 rounded-full bg-gradient-to-br from-amber-100/40 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <Eyebrow>
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-live animate-live" />
              Enterprise Asset &amp; Resource Management
            </Eyebrow>
          </div>

          <BlurInHeading
            text="One platform for every asset, resource, and workflow."
            as="h1"
            className="mx-auto mt-6 max-w-3xl font-display text-5xl font-light leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl"
          />

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-black/50">
            AssetFlow digitizes how organizations track, allocate, and maintain physical
            assets and shared resources — with structured lifecycles, conflict-free
            booking, and secure role-based approvals.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/signup" variant="filled" size="md">
              Get started <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
            <Button href="/login" variant="outline" size="md">
              Sign in to the app
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl font-light tracking-tight text-foreground">
                {s.value}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-black/40">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Product preview */}
        <HeroPreview />
      </section>

      {/* -------------------------------- Platform ------------------------------- */}
      <Section id="platform" glyph="assets" eyebrow="Platform" title="Everything asset management needs.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80}>
              <Card className="h-full">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-control border border-black/10 bg-white/60">
                  <f.icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-light text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/45">{f.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* --------------------------------- Roles --------------------------------- */}
      <Section id="roles" glyph="organization" eyebrow="Roles" title="Secure, role-based by design."
        description="Signup only ever creates an Employee — nobody self-assigns a higher role. Admins promote people in the Employee Directory.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => (
            <Reveal key={r.name} delay={(i % 4) * 80}>
              <Card className="h-full">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-black/40" strokeWidth={1.5} />
                  <h3 className="text-base font-light text-foreground">{r.name}</h3>
                </div>
                <p className="text-sm leading-relaxed text-black/45">{r.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* -------------------------------- Workflow ------------------------------- */}
      <Section id="workflow" glyph="audit" eyebrow="Workflow" title="From setup to audit, in five steps.">
        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 60}>
              <Card hover={false} className="flex items-start gap-5">
                <div className="font-display text-3xl font-light tracking-tight text-black/25">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-lg font-light text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm text-black/45">{s.body}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------------------------- CTA ---------------------------------- */}
      <section className="border-t border-black/[0.06] px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <PixelGlyph kind="dashboard" size={40} />
          <BlurInHeading
            text="Ready to digitize your asset management?"
            as="h2"
            className="mx-auto mt-5 max-w-xl text-4xl font-light tracking-tight text-foreground sm:text-5xl"
          />
          <p className="mx-auto mt-4 max-w-md text-sm text-black/45">
            Set up your organization and register your first asset in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/signup" variant="filled" size="md">
              Get started <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
            <Button href="/login" variant="outline" size="md">Sign in</Button>
          </div>
        </div>
      </section>

      {/* --------------------------------- Footer -------------------------------- */}
      <footer className="border-t border-black/[0.06] px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="font-logo text-xs tracking-[0.25em] text-black/70">
            ASSETFLOW
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] uppercase tracking-widest text-black/45">
            <a href="#platform" className="hover:text-foreground">Platform</a>
            <a href="#roles" className="hover:text-foreground">Roles</a>
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
          </div>
          <p className="text-xs text-black/35">© 2026 AssetFlow</p>
        </div>
      </footer>
    </div>
  );
}

/* --------------------------- Section wrapper ------------------------------ */
function Section({ id, glyph, eyebrow, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-black/[0.06] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <PixelGlyph kind={glyph} size={36} />
          <Eyebrow className="mt-3">{eyebrow}</Eyebrow>
          <BlurInHeading
            text={title}
            as="h2"
            className="mt-4 text-4xl font-light tracking-tight text-foreground sm:text-5xl"
          />
          {description && (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-black/45">{description}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

/* ---------------------------- Hero preview -------------------------------- */
function HeroPreview() {
  const kpis = [
    { label: "Available", value: "6" },
    { label: "Allocated", value: "4" },
    { label: "Bookings", value: "12" },
    { label: "Overdue", value: "3", danger: true },
  ];
  const activity = [
    { who: "Ananya Iyer", what: "approved maintenance · AF-0005", t: "2m" },
    { who: "Arjun Rao", what: "booked Conference Room B2", t: "14m" },
    { who: "Priya Sharma", what: "promoted Ananya to Asset Manager", t: "1h" },
  ];
  const bars = [40, 62, 78, 55, 90, 48, 70];

  return (
    <Reveal className="mx-auto mt-20 max-w-4xl">
      <div className="rounded-2xl border border-black/[0.08] bg-card/70 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur">
        <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-background">
          {/* window bar */}
          <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="ml-3 font-mono text-[11px] text-black/35">assetflow.app / dashboard</span>
          </div>

          <div className="p-5">
            {/* KPI tiles */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-control border border-black/[0.07] bg-card p-4">
                  <div className="text-[11px] uppercase tracking-widest text-black/40">{k.label}</div>
                  <div className={`mt-2 font-display text-3xl font-light tracking-tight ${k.danger ? "text-red-600" : "text-foreground"}`}>
                    {k.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {/* live activity */}
              <div className="rounded-control border border-black/[0.07] bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-live animate-live" />
                  <span className="text-[11px] uppercase tracking-widest text-black/40">Live activity</span>
                </div>
                <ul className="space-y-2.5">
                  {activity.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-black/20" />
                      <span className="flex-1 text-black/55">
                        <span className="text-foreground">{a.who}</span> {a.what}
                      </span>
                      <span className="shrink-0 font-mono text-black/30">{a.t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* mini bar chart */}
              <div className="rounded-control border border-black/[0.07] bg-card p-4">
                <div className="mb-3 text-[11px] uppercase tracking-widest text-black/40">Utilization</div>
                <div className="flex h-24 items-end gap-2">
                  {bars.map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-[3px] bg-foreground/80" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
