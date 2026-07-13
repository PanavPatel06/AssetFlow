# AssetFlow

Enterprise Asset & Resource Management System — track, allocate, and maintain
physical assets and shared resources through a centralized, role-based platform.

Built with **Next.js (App Router) + JavaScript + Tailwind CSS v4**, following the
"quiet luxury" design language in [`DESIGN.md`](./DESIGN.md). The full build plan
is in [`PLAN.md`](./PLAN.md).

> **Status: Phase 1 (Frontend) complete.** A marketing landing page plus all 10
> app screens are built and running on mock data. No backend/database yet — that's
> Phase 2. See [`PLAN.md`](./PLAN.md).

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the **marketing
landing page**. Click **Get started** (→ signup) or **Sign in** (→ login) to enter
the app. In Phase 1 any credentials work — submitting takes you to the dashboard.

**Tip:** use the **role switcher** in the top-right of the app to preview it as an
Admin, Asset Manager, Department Head, or Employee. It's a Phase-1 demo control and
is replaced by real authentication in Phase 3.

---

## What's built

**Landing page** (`/`) — floating glass nav, animated hero with a product preview,
feature grid, roles, workflow, and CTA.

**The 10 app screens:**

| # | Screen | Route |
|---|---|---|
| 1 | Login / Signup / Forgot password | `/login`, `/signup`, `/forgot-password` |
| 2 | Dashboard (KPIs, overdue vs upcoming, activity) | `/dashboard` |
| 3 | Organization Setup (Admin — 3 tabs) | `/setup` |
| 4 | Asset Directory + registration + detail/history | `/assets`, `/assets/new`, `/assets/[id]` |
| 5 | Allocation & Transfer (conflict + transfer + return) | `/allocations` |
| 6 | Resource Booking (drag/resize calendar + overlap validation) | `/bookings` |
| 7 | Maintenance (approval workflow) | `/maintenance` |
| 8 | Asset Audit (cycles, mark items, discrepancies) | `/audits` |
| 9 | Reports & Analytics (charts, heatmap, CSV export) | `/reports` |
| 10 | Activity Logs & Notifications | `/activity` |

The key business rules from the brief are demonstrated in the UI:
double-allocation is blocked (offers a transfer instead), overlapping bookings are
rejected, maintenance flows through approval, and audit cycles flag discrepancies.

---

## Design & libraries

- **Fonts:** Geist (UI), Geist Mono (code), IBM Plex Sans 300 (display headings),
  Courier Prime (logo) — via `next/font`.
- **Icons:** [Iconoir](https://iconoir.com) — clean thin-line set, re-exported
  through [`components/icons.js`](./components/icons.js) so the whole app pulls from
  one file (swapping icon libraries is a one-file change).
- **Charts:** Recharts (Reports screen).
- **Type spacing:** headings use tight tracking; body copy uses a subtle `0.7px`
  — both are single CSS variables (`--tracking-heading`, `--tracking-base`) in
  [`globals.css`](./app/globals.css).
- **Motion:** custom scroll-reveal (`Reveal`), word-by-word blur-in headings
  (`BlurInHeading`), and animated `<canvas>` pixel glyphs (`PixelGlyph`).

---

## Project structure

```
app/
  page.js            Marketing landing page (public entry at /)
  (auth)/            Login, signup, forgot-password (branded auth layout)
  (app)/             Authenticated screens (sidebar + top bar shell)
  layout.js          Root layout — fonts + global styles
  globals.css        Design tokens (colors, radius, fonts, tracking) + motion
components/
  icons.js           Central icon set (Iconoir, aliased to friendly names)
  ui/                Button, Card, Table, Modal, Tabs, StatusPill, form fields, …
  motion/            BlurInHeading, Reveal, PixelGlyph (canvas)
  shell/             Sidebar, TopBar, RoleSwitcher, AppShell
  marketing/         LandingNav (landing-page nav)
lib/
  mockData.js        Stand-in "database" for Phase 1 (swapped for the API later)
  roles.js           Roles + permission helpers
  statuses.js        Status → label/colour maps
  format.js          Date/currency helpers
  nav.js             Sidebar navigation config
  currentUser.js     Mock current-user context (→ real auth in Phase 3)
```

---

## Roadmap

- **Phase 1 — Frontend** ✅ (this) — landing page + all app screens on mock data.
- **Phase 2 — Backend** — PostgreSQL + Prisma, REST API, Auth.js, business rules.
- **Phase 3 — Integration** — replace mock data with real API calls + auth; end-to-end test.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```
