# AssetFlow

Enterprise Asset & Resource Management System — track, allocate, and maintain
physical assets and shared resources through a centralized, role-based platform.

Built with **Next.js (App Router) + JavaScript + Tailwind CSS v4**, following the
"quiet luxury" design language in `DESIGN.md` (kept locally, not tracked in this
repo) — refined against a more precisely measured version of the same spec (exact
letter-spacing formula, per-section heading scale, and per-context type tokens).
The full build plan is in `PLAN.md` (also local-only).

> **Status: Phase 1 (Frontend), Phase 2 (Backend), Phase 3 (Integration), and
> Phase 4 (Multi-tenancy) complete.** Every screen reads and writes through
> the real REST API and Auth.js session — `lib/mockData.js` is no longer
> imported anywhere. A single deployment now serves many organizations, each
> with fully isolated data. See [`PLAN.md`](./PLAN.md).

---

## Getting started

```bash
npm install
# One-time backend setup — see "Backend (Phase 2)" below for details.
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the **marketing
landing page**. Click **Get started** to create a real account — either your own
new organization, or join an existing one by its organization code — or **Sign in**
with a seeded user (e.g. `priya@acme.com` / `password123` for the Acme Admin —
see [Test credentials](#test-credentials) below for the full list, including a
second, isolated organization).

**Note:** this Next.js version renamed `middleware.js` to `proxy.js` — route
protection lives in [`proxy.js`](./proxy.js) at the project root.

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

## Test credentials

Every seeded account shares the password **`password123`**. Two isolated
organizations are seeded — use them to test both role-based permissions
*and* tenant isolation (sign in to each in a separate browser / incognito
window and confirm neither ever shows the other's data).

**Acme Inc** — organization code `acme` — the full scenario, one user per role:

| Name | Email | Role | Department | Notes |
|---|---|---|---|---|
| Priya Sharma | `priya@acme.com` | Admin | Operations | full access, incl. Organization Setup |
| Ananya Iyer | `ananya@acme.com` | Asset Manager | Operations | register/allocate assets, approve maintenance & audits |
| Raj Patel | `raj@acme.com` | Department Head | Engineering | allocate within scope, approve transfers |
| Vikram Singh | `vikram@acme.com` | Department Head | Facilities | same, different department |
| Meera Nair | `meera@acme.com` | Department Head | Finance | same, different department |
| Arjun Rao | `arjun@acme.com` | Employee | Engineering | baseline access — book resources, raise maintenance |
| Sara Khan | `sara@acme.com` | Employee | Engineering | holds AF-0002; has a pending transfer request against them |
| Dev Mehta | `dev@acme.com` | Employee | Operations | holds AF-0009 |
| Nisha Gupta | `nisha@acme.com` | Employee | Facilities | auditor on the open Q3 Facilities audit cycle |
| Karan Joshi | `karan@acme.com` | Employee | Finance | seeded **Inactive** — use to test the deactivated-account path |

**Globex Industries** — organization code `globex` — a minimal second tenant:

| Name | Email | Role | Notes |
|---|---|---|---|
| Casey Morgan | `casey@globex.example` | Admin | one department, one category, one asset (`AF-0001` — deliberately the same tag as Acme's `AF-0001`, to prove tags are scoped per organization, not global) |

To test the **signup flow** itself rather than the seed data: visit `/signup`
and either "Create a workspace" (you become a brand-new org's Admin) or "Join a
workspace" using organization code `acme` or `globex` (you join as an Employee —
an Admin then promotes you from the Employee Directory in Organization Setup).

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

## Backend (Phase 2)

A full REST API lives under `app/api/`, backed by **PostgreSQL + Prisma** and
**Auth.js (NextAuth v5)** for Credentials + JWT-session authentication. Every
screen in the app (see "Integration (Phase 3)" below) reads and writes through
this API.

### One-time setup

```bash
# 1. Create a local Postgres database (adjust to your own Postgres if needed)
createdb assetflow_app

# 2. Add a .env file at the project root:
#    DATABASE_URL="postgresql://<user>@localhost:5432/assetflow_app?schema=public"
#    AUTH_SECRET="<any long random string>"   # e.g. `openssl rand -base64 32`

# 3. Apply the schema and seed sample data (mirrors lib/mockData.js 1:1)
npm run db:migrate
npm run db:seed
```

All seeded users share the password **`password123`** — see
[Test credentials](#test-credentials) for the full list across both seeded
organizations.

### Prisma & DB scripts

```bash
npm run db:migrate   # create/apply a migration from schema.prisma
npm run db:seed       # (re-)run prisma/seed.mjs
npm run db:reset      # ⚠️ drops and recreates the DB, then reseeds
npm run db:studio     # Prisma Studio — browse/edit data in a GUI
npm run db:generate   # regenerate the Prisma Client after a schema change
```

> Pinned to **Prisma 6.x** deliberately — Prisma 7 removed the simple
> `datasource { url = env("DATABASE_URL") }` + `new PrismaClient()` pattern in
> favor of a driver-adapter model, which adds real complexity for no benefit
> at this project's scale.

### API surface

Every route requires an authenticated session (via `next-auth`'s Credentials
provider) except signup; write actions are additionally gated by role using
the same `can()` permission helper the frontend already uses
(`lib/roles.js`), so authorization rules are defined once, in one place.

| Resource | Routes |
|---|---|
| Auth | `POST /api/auth/register` (signup — creates a new organization as its Admin, or joins an existing one as an Employee) · `/api/auth/[...nextauth]` (Auth.js) |
| Organization | `GET /api/organization` (the current user's org — name + shareable code) |
| Departments | `GET/POST /api/departments`, `GET/PATCH /api/departments/[id]` — `GET` also accepts an unauthenticated `?organizationSlug=` for the signup form's "join" step |
| Categories | `GET/POST /api/categories`, `GET/PATCH /api/categories/[id]` |
| Employees | `GET /api/employees`, `GET/PATCH /api/employees/[id]` (role/status — the only place roles change) |
| Assets | `GET/POST /api/assets` (search via `?q=&categoryId=&status=`), `GET/PATCH /api/assets/[id]` |
| Allocations | `GET/POST /api/allocations`, `GET /api/allocations/[id]`, `POST /api/allocations/[id]/return` |
| Transfers | `GET/POST /api/transfers`, `PATCH /api/transfers/[id]` (approve/reject) |
| Bookings | `GET/POST /api/bookings`, `GET/PATCH /api/bookings/[id]` (reschedule), `POST /api/bookings/[id]/cancel` |
| Maintenance | `GET/POST /api/maintenance`, `GET/PATCH /api/maintenance/[id]` (workflow actions) |
| Audits | `GET/POST /api/audits`, `GET /api/audits/[id]`, `POST /api/audits/[id]/close`, `PATCH /api/audits/[id]/items/[itemId]` |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/[id]`, `POST /api/notifications/mark-all-read` |
| Activity log | `GET /api/activity` |
| Dashboard | `GET /api/dashboard` (KPI + overdue/upcoming + recent-activity aggregates) |

### Business rules enforced server-side

- **Tenant isolation** — every table that matters is scoped by `organizationId`,
  rooted in the session (never trusted from the request body). Every route
  filters its queries and validates every referenced ID (asset, employee,
  department, holder, auditor...) against the caller's own organization before
  acting on it, so one organization's data can never be read, listed, or
  linked to by another's. Asset tags (`AF-0001`...) are unique per organization,
  not globally — two orgs can both have an `AF-0001`. `User.email` is the one
  exception and stays globally unique (one email = one account = one org), so
  login doesn't need an organization selector.
- **No double-allocation** — allocating an already-actively-held asset returns
  `409` with the current holder, instead of silently succeeding.
- **No overlapping bookings** — same resource, overlapping times → `409`;
  a booking starting exactly when another ends is allowed (adjacent, not
  overlapping) — matches the brief's exact example.
- **Maintenance is a strict state machine** — Pending → Approved/Rejected →
  Technician Assigned → In Progress → Resolved; each action is only valid
  from its specific preceding state. Asset flips to Under Maintenance on
  approval and back on resolution — correctly restoring `Allocated`/`Reserved`
  rather than blindly `Available` if the asset is still actively held.
- **Transfer approval reallocates atomically** — the old allocation is closed
  out and a new one opened in the same transaction, so history stays accurate.
- **Closing an audit cycle locks it** — further item edits are rejected, and
  any item confirmed `MISSING` flips its asset to `Lost`.

## Integration (Phase 3)

Every screen is a client component that fetches from `app/api/*` via a small
shared wrapper (`lib/apiClient.js`) instead of importing `lib/mockData.js`.
Fake `setState`-only mutations were replaced with real API calls; conflict
responses (`409` double-allocation / overlapping booking) surface inline
exactly where the old mock-only UI used to simulate them.

- **Auth** — `lib/currentUser.js` now wraps Auth.js's `useSession()`; the
  Phase-1 role switcher is gone. [`proxy.js`](./proxy.js) (this Next.js
  version's renamed `middleware.js`) protects every authenticated route,
  redirecting signed-out visitors to `/login`.
- **Notifications** — `lib/notifications.js` is a small shared provider (one
  fetch of `/api/notifications`, mounted once in `AppShell`) so the top-bar
  unread badge and the Activity screen can never drift out of sync.
- **Bookings** — the drag/resize timeline still commits optimistically for a
  snappy feel, then persists via `PATCH /api/bookings/[id]`; a `409` reverts
  the block to its last known-good position.
- Not in scope: file uploads (asset photos stay a decorative drop-zone) and
  the "forgot password" flow (no email infra).

## Project structure

```
app/
  page.js            Marketing landing page (public entry at /)
  (auth)/            Login, signup (create/join an organization), forgot-password
  (app)/             Authenticated screens (sidebar + top bar shell)
  api/               REST API route handlers (backend)
  api/organization/  Current user's organization (name + shareable code)
  layout.js          Root layout — fonts, SessionProvider, global styles
  globals.css        Design tokens (colors, radius, fonts, tracking) + motion
proxy.js             Route protection (this Next.js version's renamed middleware.js)
components/
  icons.js           Central icon set (Iconoir, aliased to friendly names)
  ui/                Button, Card, Table, Modal, Tabs, StatusPill, form fields, …
  motion/            BlurInHeading, Reveal, PixelGlyph (canvas)
  shell/             Sidebar, TopBar, AppShell
  marketing/         LandingNav (landing-page nav)
lib/
  mockData.js        No longer imported anywhere — kept only as a data reference
  roles.js           Roles + permission helpers (shared by frontend AND the API)
  statuses.js        Status → label/colour maps
  format.js          Date/currency helpers
  nav.js             Sidebar navigation config
  currentUser.js     useCurrentUser() — thin wrapper around Auth.js's useSession()
  apiClient.js       apiFetch() — shared fetch wrapper for every screen
  notifications.js   Shared notifications provider (TopBar badge + Activity screen)
  prisma.js          Prisma Client singleton (backend)
  auth.js            Auth.js (NextAuth v5) config — Credentials + JWT (backend)
  apiAuth.js          requireUser()/requireCapability() route guards (backend)
  validation.js       Zod schemas for every API resource (backend)
  activity.js         logActivity()/notify() helpers (backend)
prisma/
  schema.prisma       Full data model (Organization + 13 tenant-scoped entities, enums matching lib/statuses.js)
  seed.mjs            Seeds two isolated organizations (Acme, mirroring lib/mockData.js 1:1, + a small Globex)
  migrations/         Prisma migration history
```

---

## Roadmap

- **Phase 1 — Frontend** ✅ — landing page + all app screens on mock data.
- **Phase 2 — Backend** ✅ — PostgreSQL + Prisma, REST API, Auth.js, business rules.
- **Phase 3 — Integration** ✅ — every screen wired to the real API + Auth.js session.
- **Phase 4 — Multi-tenancy** ✅ — one deployment serves many organizations;
  every table, route, and query is scoped by `organizationId`; signup can
  create a new organization or join an existing one by its shareable code.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

See [Backend (Phase 2)](#backend-phase-2) above for the `db:*` scripts.

---

## Deployment (Vercel)

This app needs a real Node.js server at runtime — Prisma + Postgres, Auth.js
JWT sessions, and [`proxy.js`](./proxy.js) all execute server-side — so it
can't be a static export. Vercel (built by the Next.js team) handles this
with zero extra config.

1. **Push to GitHub** and import the repo at [vercel.com/new](https://vercel.com/new).
2. **Provision Postgres** — [Neon](https://neon.tech) or
   [Supabase](https://supabase.com) both work well with Prisma; grab the
   connection string.
3. **Set environment variables** in Vercel → Project → Settings →
   Environment Variables:
   - `DATABASE_URL` — the production Postgres connection string
   - `AUTH_SECRET` — a **new** secret (`openssl rand -base64 32`), never
     reused from local `.env`
   - `AUTH_URL` — your production URL once known, e.g. `https://assetflow.vercel.app`
4. **Apply migrations** against the production database before it serves
   traffic:
   ```bash
   DATABASE_URL="<production-url>" npx prisma migrate deploy
   ```
5. **Seed (optional)** — only if you want a demo organization live:
   ```bash
   DATABASE_URL="<production-url>" node prisma/seed.mjs
   ```
   Otherwise leave the database empty and let your first real user sign up
   via "Create a workspace" on `/signup` — they become that organization's
   Admin.
6. **Deploy** — `vercel --prod`, or just push to the connected GitHub branch.

Because every table, route, and query is scoped by `organizationId`
([see Business rules](#business-rules-enforced-server-side)), this one
deployment safely serves every organization that signs up — no per-tenant
infrastructure needed.
