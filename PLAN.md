# AssetFlow — Build Plan

> Enterprise Asset & Resource Management System
> This plan is for your approval **before** any code is written. Nothing is built yet.

---

## 0. How to read this plan

We build in **three phases, in order**, exactly as you asked:

1. **Phase 1 — Frontend** — every screen, fully clickable, running on *mock (fake) data*. No database yet.
2. **Phase 2 — Backend** — the database, the API, authentication, and all the business rules.
3. **Phase 3 — Integration** — swap the mock data for real API calls, then test the whole thing end-to-end.

Everything is one **Next.js** project written in **plain JavaScript** (no TypeScript), so it stays easy to read.

---

## 1. Final Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router), JavaScript** | Your pick. One project holds both the pages and the API. |
| Styling | **Tailwind CSS** | Matches the utility-class style in DESIGN.md; fast to build the exact look. |
| Fonts | **next/font** — Geist, Geist Mono, IBM Plex Sans (300), Courier Prime | Exactly the fonts DESIGN.md specifies. |
| Database | **PostgreSQL** | Your pick. Relational — perfect for the strict allocation/booking rules. |
| Data access | **Prisma** | Readable JavaScript models; auto-generates a type-safe client and migrations. |
| Auth | **Auth.js (NextAuth v5), Credentials + JWT** + **bcrypt** for passwords | Standard for Next.js; gives us sessions + "who is logged in" everywhere. Roles enforced in our own code. |
| Validation | **Zod** | One schema validates a form on the frontend *and* the API on the backend. |
| API style | **Next.js Route Handlers** (`app/api/...`) returning JSON | This is our REST backend, living in the same project. |
| Charts (Reports) | **Recharts** | Simple React charts for the analytics screen. |
| Notifications/live feel | polling + `setInterval` refresh | Matches DESIGN.md's "live data" illusion without extra infrastructure. |

> **Design note:** DESIGN.md is a *landing-page* spec. We reuse its **tokens, typography, borders, motion, and pixel-glyph accents** on an **application shell** (top bar + sidebar + content). We do **not** copy the hero/pricing/marquee sections into the app.

---

## 2. Data Model (the foundation everything depends on)

These become Prisma models in Phase 2, but we design them now because the frontend forms and tables are shaped by them.

**Core master data**
- **User** — name, email, passwordHash, **role** (`ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE`), department, status (`ACTIVE | INACTIVE`).
- **Department** — name, head (User), optional **parent department** (for hierarchy), status.
- **AssetCategory** — name, plus **optional custom fields** (e.g. warranty period for Electronics), stored flexibly.

**Assets & lifecycle**
- **Asset** — name, category, auto **Asset Tag** (`AF-0001`), serial number, acquisition date, acquisition cost (reports only, *not* accounting), condition, location, photos/documents, **`isBookable`** flag, and **status**: `AVAILABLE | ALLOCATED | RESERVED | UNDER_MAINTENANCE | LOST | RETIRED | DISPOSED`.

**Workflows (each keeps its own history)**
- **Allocation** — asset, holder (employee/department), allocatedBy, dates, **expectedReturnDate**, returnDate, check-in condition notes, status. *Rule: at most one active allocation per asset.*
- **TransferRequest** — asset, from → to holder, requestedBy, approvedBy, status `REQUESTED → APPROVED/REJECTED → REALLOCATED`.
- **Booking** — resource (bookable asset), bookedBy, start, end, status `UPCOMING | ONGOING | COMPLETED | CANCELLED`. *Rule: no overlapping times for the same resource.*
- **MaintenanceRequest** — asset, raisedBy, issue, priority, photo, technician, approvedBy, status `PENDING → APPROVED/REJECTED → TECHNICIAN_ASSIGNED → IN_PROGRESS → RESOLVED`.
- **AuditCycle** + **AuditAssignment** (auditors) + **AuditItem** — per-asset result `VERIFIED | MISSING | DAMAGED`; closing the cycle flips confirmed-missing assets to `LOST`.

**System**
- **Notification** — user, type, message, read flag, timestamp.
- **ActivityLog** — actor, action, entity, timestamp (who did what, when).

**Business rules enforced in the backend (Phase 2):**
1. Can't allocate an already-allocated asset → block + offer **Transfer Request**.
2. Bookings can't overlap for the same resource (`10:00–11:00` after `9:00–10:00` is OK; `9:30–10:30` is rejected).
3. Maintenance approval → asset becomes `UNDER_MAINTENANCE`; resolution → back to `AVAILABLE`.
4. Overdue returns (past expected return date) auto-flagged → dashboard + notifications.
5. Closing an audit cycle → confirmed-missing assets become `LOST`.

---

## 3. Roles & Permissions (summary)

| Capability | Admin | Asset Manager | Dept Head | Employee |
|---|:--:|:--:|:--:|:--:|
| Org setup (depts, categories, directory, role assignment) | ✅ | | | |
| Register assets | ✅ | ✅ | | |
| Allocate / approve transfers / approve returns | ✅ | ✅ | dept only | |
| Approve maintenance / assign technician | ✅ | ✅ | | |
| Book shared resources | ✅ | ✅ | ✅ (for dept) | ✅ |
| Raise maintenance / initiate return or transfer | ✅ | ✅ | ✅ | ✅ |
| Run audit cycles / assign auditors | ✅ | ✅ | | |
| Org-wide analytics | ✅ | ✅ | dept view | |
| View own allocated assets | ✅ | ✅ | ✅ | ✅ |

*Key rule from the brief: signup creates an **Employee only** — nobody self-assigns a higher role. Admin promotes people in the Employee Directory.*

---

## 4. Phase 1 — Frontend (mock data)

**Step 1.1 — Project + design foundation**
- Create the Next.js (JS) project, install Tailwind, configure the **design tokens** from DESIGN.md (colors, `--radius`, fonts).
- Global styles + fonts via `next/font`. Enforce the global rules: weight-300 headings, muted body text, hairline borders, 200ms hover / 700ms reveal timings.

**Step 1.2 — Reusable component library** (built once, used everywhere)
- `Button` (outline + filled), `Card`, `Badge`/`EyebrowPill`, `KpiCard`, `StatusPill`, `Table`/`LogRow`, `Modal`, `Tabs`, form inputs, `Sidebar` + `TopBar` app shell.
- Signature DESIGN.md pieces: **`PixelGlyph`** (animated `<canvas>`) and **`BlurInHeading`** (IntersectionObserver word-by-word reveal).

**Step 1.3 — All 10 screens with mock data + a `/lib/mockData.js` file**

| # | Screen | Route |
|---|---|---|
| 1 | Login / Signup / Forgot password | `/login`, `/signup` |
| 2 | Dashboard (KPI cards, overdue vs upcoming, quick actions) | `/dashboard` |
| 3 | Organization Setup (Admin) — 3 tabs | `/setup` |
| 4 | Asset Registration & Directory (+ detail + history) | `/assets`, `/assets/[id]` |
| 5 | Asset Allocation & Transfer | `/allocations` |
| 6 | Resource Booking (calendar + overlap UI) | `/bookings` |
| 7 | Maintenance Management | `/maintenance` |
| 8 | Asset Audit (cycles, auditors, discrepancies) | `/audits`, `/audits/[id]` |
| 9 | Reports & Analytics (charts, heatmap, export) | `/reports` |
| 10 | Activity Logs & Notifications | `/activity` |

- Role-based UI is *simulated* in Phase 1 via a mock "current user" switcher, so we can see each role's view before real auth exists.
- **Optional (only if you want it):** a public landing page that uses the literal DESIGN.md sections.

*Deliverable: a fully clickable app you can navigate end-to-end, no backend needed.*

---

## 5. Phase 2 — Backend (database + API + rules)

**Step 2.1** — Prisma schema for all models in §2 + first migration to PostgreSQL + a **seed script** (sample departments, users of each role, categories, assets, bookings, etc.).

**Step 2.2** — Auth: Auth.js Credentials provider, bcrypt password hashing, JWT sessions, signup-as-Employee-only, session validation, forgot-password flow, and a `requireRole()` helper + route protection.

**Step 2.3** — REST API route handlers under `app/api/` for every resource (users, departments, categories, assets, allocations, transfers, bookings, maintenance, audits, notifications, reports), with Zod validation.

**Step 2.4** — Implement the 5 business rules from §2 server-side (single-allocation, no-overlap booking, maintenance status flips, overdue flagging, audit-close → LOST) + write ActivityLog / Notification entries on the relevant actions.

*Deliverable: an API you can hit (via a REST client) that enforces every rule, independent of the UI.*

---

## 6. Phase 3 — Integration

- Replace `mockData.js` usage with real `fetch` calls to the API, screen by screen.
- Wire real auth (replace the mock user switcher with the real logged-in session + real role gating).
- Connect dashboard KPIs, notifications, and the "live" feeds to real data.
- **End-to-end test of the core workflow** from the brief: Admin sets up org → Manager registers asset → allocate (and see a conflict blocked + transfer) → book a resource (and see an overlap rejected) → raise & approve maintenance → return/overdue flag → run & close an audit → confirm logs/notifications/reports updated.
- Polish: loading/empty/error states, responsive checks, accessibility pass.

---

## 7. Suggested build order (milestones)

1. **M1** — Project scaffold + design tokens + component library (Steps 1.1–1.2).
2. **M2** — Screens 1–3 (auth pages, dashboard, org setup) on mock data.
3. **M3** — Screens 4–7 (assets, allocation/transfer, booking, maintenance) on mock data.
4. **M4** — Screens 8–10 (audit, reports, activity) on mock data → **Phase 1 complete**.
5. **M5** — Prisma schema + migrations + seed + auth (Steps 2.1–2.2).
6. **M6** — All API routes + business rules (Steps 2.3–2.4) → **Phase 2 complete**.
7. **M7** — Integrate + end-to-end test + polish → **Phase 3 complete**.

I'll pause for your review at the end of each phase (M4, M6, M7) before moving on.

---

## 8. A few things to confirm / notes

- **Auth:** I recommend **Auth.js (NextAuth v5)**. If you'd rather see a simpler hand-written JWT setup for learning, say so and I'll switch.
- **Local Postgres:** you'll need Postgres running locally in Phase 2 (or a free hosted one). I can also start on **SQLite** for zero setup and switch to Postgres later — your call when we reach Phase 2.
- **File uploads** (asset photos/documents): I'll keep this simple (local storage) unless you want a cloud bucket.
- **Git:** You commit yourself — I won't push. I can suggest commit points at each milestone.

---

*Please review. Tell me what to change, or approve and I'll start with M1 (project scaffold + design foundation).*
