# AssetFlow

**Multi-tenant asset & resource management platform.** Organizations track their
physical assets, allocate them to people and departments, book shared resources,
run maintenance approvals, and close out audit cycles — all from one deployment,
with every organization's data fully isolated from every other's.

**Live:** [asset-flow-tan-beta.vercel.app](https://asset-flow-tan-beta.vercel.app) —
sign in with a demo account below, or create your own workspace.

`Next.js 16 (App Router)` · `React 19` · `PostgreSQL` · `Prisma` · `Auth.js v5` · `Tailwind CSS v4` · `Recharts` · `Zod`

---

## The problem

Most companies track assets in a spreadsheet. That works until two people claim
the same laptop, someone books a conference room that's already taken, a
maintenance request bypasses approval, or nobody can say who had an asset six
months ago. Those are all concurrency and workflow problems, and a spreadsheet
has no way to enforce them.

AssetFlow encodes the rules in the database and the API layer, so they hold no
matter which screen (or which client) tries to break them.

## Feature tour

| Screen | Route | What it does |
|---|---|---|
| Landing | `/` | Public marketing page — glass nav, animated hero, feature grid |
| Auth | `/login`, `/signup` | Create a workspace (become its Admin) or join one by org code |
| Dashboard | `/dashboard` | KPI tiles, overdue vs. upcoming returns, recent activity feed |
| Organization Setup | `/setup` | Admin-only — departments, asset categories, employee directory & role management |
| Asset Directory | `/assets` | Search/filter by tag, category, status; registration form; per-asset detail + full history |
| Allocation & Transfer | `/allocations` | Allocate, return, and transfer assets with approval |
| Resource Booking | `/bookings` | Drag/resize timeline calendar with live overlap validation |
| Maintenance | `/maintenance` | Request → approve → assign technician → resolve, as a kanban board |
| Asset Audit | `/audits` | Open a cycle, mark items verified/missing/damaged, auto-generate a discrepancy report |
| Reports | `/reports` | Utilization by department, maintenance frequency, booking heatmap, CSV export |
| Activity & Notifications | `/activity` | Filterable audit trail + unread notification badge |

## Engineering highlights

The parts of this build that were actually interesting to solve:

**Multi-tenancy that doesn't leak.** Every tenant-scoped table carries an
`organizationId` that is read from the signed session, never from the request
body. Each route filters its own queries *and* re-validates every referenced ID
(asset, employee, department, holder, auditor) against the caller's organization
before acting on it — so a hand-crafted request with another org's asset ID gets
a 404, not a cross-tenant write. Asset tags are unique *per organization* via a
composite constraint, so two orgs can both own an `AF-0001`. `User.email` stays
globally unique so login needs no tenant selector.

**Conflict detection as a real constraint, not a UI check.** Allocating an
already-held asset returns `409` with the current holder attached, so the UI can
offer a transfer instead of silently double-booking. Overlapping bookings on the
same resource return `409` too — with an interval comparison that deliberately
allows a booking starting exactly when another ends.

**Maintenance is a strict state machine.** Pending → Approved/Rejected →
Technician Assigned → In Progress → Resolved, with each transition valid only
from its specific predecessor. Approval flips the asset to *Under Maintenance*;
resolution restores its **previous** state — back to `Allocated` or `Reserved`
if the asset is still actively held, rather than blindly resetting to
`Available`.

**Atomic reallocation.** Approving a transfer closes the outgoing allocation and
opens the incoming one inside a single Prisma transaction, so the asset's
ownership history can never show a gap or an overlap.

**One permission table, two consumers.** `lib/roles.js` defines four roles and
eight capabilities. The React app imports it to hide nav items and disable
buttons; the API routes import the same `can()` helper to reject the request.
Authorization is defined once — the UI and the server cannot drift apart.

**Optimistic UI with server reconciliation.** The booking timeline commits
drag/resize moves locally for a snappy feel, then persists via `PATCH`. A `409`
from the overlap check rolls the block back to its last known-good position.

**Serverless-aware data layer.** Deployed on Vercel with split
`DATABASE_URL` (pooled) and `DIRECT_URL` (session-mode) connection strings —
the pooled endpoint for runtime, the direct one for `prisma migrate deploy`,
which a transaction-mode pooler can't serve.

## Architecture

```
Browser ──► Next.js App Router (React 19 client components)
              │  lib/apiClient.js — shared fetch wrapper
              ▼
            app/api/* — 30 REST route handlers
              │  requireUser() / requireCapability()  ← session + RBAC guard
              │  Zod schemas                          ← input validation
              │  lib/roles.js can()                   ← same rules as the UI
              ▼
            Prisma ORM ──► PostgreSQL
                            14 models, 13 enums, org-scoped throughout
```

Route protection lives in [`proxy.js`](./proxy.js) at the project root — this
Next.js version renamed `middleware.js` to `proxy.js`. Signed-out visitors
hitting any authenticated route are redirected to `/login`.

Roughly 7,000 lines across 65 source files.

### API surface

Every route requires an authenticated session except signup; writes are
additionally gated by role.

| Resource | Routes |
|---|---|
| Auth | `POST /api/auth/register` · `/api/auth/[...nextauth]` |
| Organization | `GET /api/organization` |
| Departments | `GET/POST /api/departments`, `GET/PATCH /api/departments/[id]` |
| Categories | `GET/POST /api/categories`, `GET/PATCH /api/categories/[id]` |
| Employees | `GET /api/employees`, `GET/PATCH /api/employees/[id]` |
| Assets | `GET/POST /api/assets` (`?q=&categoryId=&status=`), `GET/PATCH /api/assets/[id]` |
| Allocations | `GET/POST /api/allocations`, `GET /api/allocations/[id]`, `POST /api/allocations/[id]/return` |
| Transfers | `GET/POST /api/transfers`, `PATCH /api/transfers/[id]` |
| Bookings | `GET/POST /api/bookings`, `GET/PATCH /api/bookings/[id]`, `POST /api/bookings/[id]/cancel` |
| Maintenance | `GET/POST /api/maintenance`, `GET/PATCH /api/maintenance/[id]` |
| Audits | `GET/POST /api/audits`, `GET /api/audits/[id]`, `POST /api/audits/[id]/close`, `PATCH /api/audits/[id]/items/[itemId]` |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/[id]`, `POST /api/notifications/mark-all-read` |
| Activity | `GET /api/activity` |
| Dashboard | `GET /api/dashboard` |

### Data model

`Organization` plus 13 tenant-scoped entities: `User`, `Department`,
`AssetCategory`, `Asset`, `Allocation`, `TransferRequest`, `Booking`,
`MaintenanceRequest`, `AuditCycle`, `AuditItem`, `Notification`, `ActivityLog`.
All status values are Postgres enums generated from the same vocabulary the
frontend uses in `lib/statuses.js`.

## Running locally

```bash
npm install
createdb assetflow_app
```

Add a `.env` at the project root:

```
DATABASE_URL="postgresql://<user>@localhost:5432/assetflow_app?schema=public"
AUTH_SECRET="<any long random string>"   # openssl rand -base64 32
```

Then:

```bash
npm run db:migrate   # apply the schema
npm run db:seed      # seed two isolated demo organizations
npm run dev
```

Open [localhost:3000](http://localhost:3000).

**Scripts:** `dev` · `build` · `start` · `lint` · `db:migrate` · `db:seed` ·
`db:reset` · `db:studio` · `db:generate`

> Pinned to Prisma 6.x deliberately — Prisma 7 replaced the
> `datasource { url = env(...) }` + `new PrismaClient()` pattern with a
> driver-adapter model that adds real complexity for no benefit at this scale.

## Demo accounts

Every seeded account uses the password **`password123`**. Two isolated
organizations are seeded — sign into each in separate browser profiles to
verify neither can ever see the other's data.

**Acme Inc** (org code `acme`) — one user per role:

| Email | Role | Department | Notes |
|---|---|---|---|
| `priya@acme.com` | Admin | Operations | full access, incl. Organization Setup |
| `ananya@acme.com` | Asset Manager | Operations | register/allocate, approve maintenance & audits |
| `raj@acme.com` | Department Head | Engineering | allocate in scope, approve transfers |
| `vikram@acme.com` | Department Head | Facilities | same, different department |
| `meera@acme.com` | Department Head | Finance | same, different department |
| `arjun@acme.com` | Employee | Engineering | baseline access |
| `sara@acme.com` | Employee | Engineering | holds AF-0002, has a pending transfer against them |
| `dev@acme.com` | Employee | Operations | holds AF-0009 |
| `nisha@acme.com` | Employee | Facilities | auditor on the open Q3 Facilities cycle |
| `karan@acme.com` | Employee | Finance | seeded **Inactive** — tests the deactivated-account path |

**Globex Industries** (org code `globex`) — a minimal second tenant:
`casey@globex.example` (Admin). Its one asset is deliberately also tagged
`AF-0001`, proving tags are scoped per organization rather than globally.

To exercise signup itself, visit `/signup` and either create a workspace (you
become its Admin) or join `acme`/`globex` by code (you join as an Employee; an
Admin promotes you from the Employee Directory).

## Deploying

The app needs a Node runtime — Prisma, Auth.js JWT sessions and `proxy.js` all
execute server-side, so a static export won't work.

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Provision Postgres ([Neon](https://neon.tech) or [Supabase](https://supabase.com)) and grab **both** connection strings — pooled and direct.
3. Set env vars: `DATABASE_URL` (pooled), `DIRECT_URL` (direct), `AUTH_SECRET` (a fresh one, never the local value), `AUTH_URL` (your production URL).
4. Apply migrations against production using the **direct** URL:
   ```bash
   DATABASE_URL="<direct-production-url>" npx prisma migrate deploy
   ```
5. Deploy. `postinstall` runs `prisma generate`, so the client always matches the committed schema — no extra build config.

Serverless functions each open their own DB connection, which is why runtime
traffic must go through the pooler; skipping that exhausts Postgres' connection
limit under real load. Because every table and query is org-scoped, this single
deployment serves every organization that signs up — no per-tenant
infrastructure.

## Design

The UI follows a "quiet luxury" spec: Geist for UI, IBM Plex Sans 300 for
display headings, Courier Prime for the logo, all via `next/font`. Letter
spacing is driven by two CSS variables (`--tracking-heading`,
`--tracking-base`) rather than scattered per-component values. Icons come from
[Iconoir](https://iconoir.com), re-exported through a single
[`components/icons.js`](./components/icons.js) — swapping icon libraries is a
one-file change. Motion is hand-rolled: scroll reveals, word-by-word blur-in
headings, and animated `<canvas>` pixel glyphs.

## Not in scope

File uploads (asset photos are a decorative drop-zone) and password reset
(no email infrastructure) — both are stubbed in the UI rather than half-built.
