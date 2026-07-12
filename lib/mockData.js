// -----------------------------------------------------------------------------
// AssetFlow — MOCK DATA (Phase 1 / frontend only)
//
// This file stands in for the database while we build the UI. In Phase 3 the
// screens that read from here will be pointed at the real API instead.
// Everything is plain JS objects + a few lookup helpers at the bottom.
// -----------------------------------------------------------------------------

import { ROLES } from "./roles";

// --- Departments --------------------------------------------------------------
export const departments = [
  { id: "d1", name: "Engineering", headId: "e2", parentId: null, status: "ACTIVE" },
  { id: "d2", name: "Operations", headId: "e3", parentId: null, status: "ACTIVE" },
  { id: "d3", name: "Facilities", headId: "e4", parentId: "d2", status: "ACTIVE" },
  { id: "d4", name: "Finance", headId: "e5", parentId: null, status: "ACTIVE" },
  { id: "d5", name: "Field Sales", headId: null, parentId: "d2", status: "INACTIVE" },
];

// --- Employees / Users --------------------------------------------------------
// role is assigned by the Admin only (never at signup).
export const employees = [
  { id: "e1", name: "Priya Sharma", email: "priya@acme.com", departmentId: "d2", role: ROLES.ADMIN, title: "System Administrator", status: "ACTIVE" },
  { id: "e2", name: "Raj Patel", email: "raj@acme.com", departmentId: "d1", role: ROLES.DEPARTMENT_HEAD, title: "Head of Engineering", status: "ACTIVE" },
  { id: "e3", name: "Ananya Iyer", email: "ananya@acme.com", departmentId: "d2", role: ROLES.ASSET_MANAGER, title: "Asset Manager", status: "ACTIVE" },
  { id: "e4", name: "Vikram Singh", email: "vikram@acme.com", departmentId: "d3", role: ROLES.DEPARTMENT_HEAD, title: "Facilities Lead", status: "ACTIVE" },
  { id: "e5", name: "Meera Nair", email: "meera@acme.com", departmentId: "d4", role: ROLES.DEPARTMENT_HEAD, title: "Finance Lead", status: "ACTIVE" },
  { id: "e6", name: "Arjun Rao", email: "arjun@acme.com", departmentId: "d1", role: ROLES.EMPLOYEE, title: "Software Engineer", status: "ACTIVE" },
  { id: "e7", name: "Sara Khan", email: "sara@acme.com", departmentId: "d1", role: ROLES.EMPLOYEE, title: "QA Engineer", status: "ACTIVE" },
  { id: "e8", name: "Dev Mehta", email: "dev@acme.com", departmentId: "d2", role: ROLES.EMPLOYEE, title: "Ops Associate", status: "ACTIVE" },
  { id: "e9", name: "Nisha Gupta", email: "nisha@acme.com", departmentId: "d3", role: ROLES.EMPLOYEE, title: "Facilities Coordinator", status: "ACTIVE" },
  { id: "e10", name: "Karan Joshi", email: "karan@acme.com", departmentId: "d4", role: ROLES.EMPLOYEE, title: "Accounts Assistant", status: "INACTIVE" },
];

// --- Asset Categories ---------------------------------------------------------
// customFields = extra per-category attributes (e.g. warranty for Electronics).
export const categories = [
  { id: "c1", name: "Electronics", customFields: ["Warranty Period", "Voltage"], count: 6 },
  { id: "c2", name: "Furniture", customFields: [], count: 2 },
  { id: "c3", name: "Vehicles", customFields: ["Registration No.", "Fuel Type"], count: 2 },
  { id: "c4", name: "Equipment", customFields: ["Warranty Period"], count: 3 },
  { id: "c5", name: "Rooms", customFields: ["Capacity"], count: 2 },
];

// --- Assets -------------------------------------------------------------------
// holderType: "EMPLOYEE" | "DEPARTMENT" | null
export const assets = [
  { id: "a1", tag: "AF-0001", name: 'MacBook Pro 16"', categoryId: "c1", serial: "C02FP-2291", acquisitionDate: "2024-03-11", acquisitionCost: 2400, condition: "Good", location: "HQ · Floor 3", isBookable: false, status: "ALLOCATED", holderType: "EMPLOYEE", holderId: "e6" },
  { id: "a2", tag: "AF-0002", name: "Dell Latitude 7440", categoryId: "c1", serial: "DL7440-8821", acquisitionDate: "2023-09-02", acquisitionCost: 1500, condition: "Fair", location: "HQ · Floor 3", isBookable: false, status: "ALLOCATED", holderType: "EMPLOYEE", holderId: "e7" },
  { id: "a3", tag: "AF-0003", name: "Standing Desk Pro", categoryId: "c2", serial: "SD-1042", acquisitionDate: "2022-06-18", acquisitionCost: 600, condition: "Good", location: "HQ · Floor 2", isBookable: false, status: "AVAILABLE", holderType: null, holderId: null },
  { id: "a4", tag: "AF-0004", name: "Toyota Hiace Van", categoryId: "c3", serial: "MH02-VN-4412", acquisitionDate: "2021-01-20", acquisitionCost: 32000, condition: "Good", location: "Depot · Bay 1", isBookable: true, status: "AVAILABLE", holderType: null, holderId: null },
  { id: "a5", tag: "AF-0005", name: "Epson Projector EB-2250U", categoryId: "c4", serial: "EP-2250-771", acquisitionDate: "2022-11-05", acquisitionCost: 900, condition: "Poor", location: "HQ · Floor 1", isBookable: false, status: "UNDER_MAINTENANCE", holderType: null, holderId: null },
  { id: "a6", tag: "AF-0006", name: "Conference Room B2", categoryId: "c5", serial: "ROOM-B2", acquisitionDate: "2020-01-01", acquisitionCost: 0, condition: "Good", location: "HQ · Floor 2", isBookable: true, status: "AVAILABLE", holderType: null, holderId: null },
  { id: "a7", tag: "AF-0007", name: "Conference Room A1", categoryId: "c5", serial: "ROOM-A1", acquisitionDate: "2020-01-01", acquisitionCost: 0, condition: "Good", location: "HQ · Floor 1", isBookable: true, status: "AVAILABLE", holderType: null, holderId: null },
  { id: "a8", tag: "AF-0008", name: 'iPad Pro 12.9"', categoryId: "c1", serial: "IPD-9930", acquisitionDate: "2023-04-14", acquisitionCost: 1100, condition: "Good", location: "HQ · Floor 3", isBookable: false, status: "RESERVED", holderType: "DEPARTMENT", holderId: "d1" },
  { id: "a9", tag: "AF-0009", name: "Ergonomic Office Chair", categoryId: "c2", serial: "CH-ERG-220", acquisitionDate: "2022-08-30", acquisitionCost: 450, condition: "Good", location: "HQ · Floor 2", isBookable: false, status: "ALLOCATED", holderType: "EMPLOYEE", holderId: "e8" },
  { id: "a10", tag: "AF-0010", name: "Warehouse Forklift", categoryId: "c4", serial: "FL-9921", acquisitionDate: "2018-05-12", acquisitionCost: 18000, condition: "Retired", location: "Depot · Bay 3", isBookable: false, status: "RETIRED", holderType: null, holderId: null },
  { id: "a11", tag: "AF-0011", name: "Honda City Sedan", categoryId: "c3", serial: "MH02-SD-1180", acquisitionDate: "2022-02-11", acquisitionCost: 21000, condition: "Good", location: "Depot · Bay 2", isBookable: true, status: "AVAILABLE", holderType: null, holderId: null },
  { id: "a12", tag: "AF-0012", name: "Brother Label Printer", categoryId: "c4", serial: "BR-LP-330", acquisitionDate: "2023-07-19", acquisitionCost: 220, condition: "Unknown", location: "HQ · Floor 1", isBookable: false, status: "LOST", holderType: null, holderId: null },
  { id: "a13", tag: "AF-0013", name: 'LG UltraFine 27" Monitor', categoryId: "c1", serial: "LG-27UF-556", acquisitionDate: "2024-01-08", acquisitionCost: 500, condition: "Good", location: "HQ · Floor 3", isBookable: false, status: "AVAILABLE", holderType: null, holderId: null },
  { id: "a14", tag: "AF-0114", name: "ThinkPad X1 Carbon", categoryId: "c1", serial: "TP-X1-0114", acquisitionDate: "2023-12-01", acquisitionCost: 1700, condition: "Good", location: "HQ · Floor 2", isBookable: false, status: "ALLOCATED", holderType: "EMPLOYEE", holderId: "e1" },
];

// --- Allocations (active + returned history) ----------------------------------
export const allocations = [
  { id: "al1", assetId: "a1", holderType: "EMPLOYEE", holderId: "e6", allocatedById: "e3", allocatedOn: "2026-06-15", expectedReturn: "2026-08-15", returnedOn: null, status: "ACTIVE", checkInNotes: null },
  { id: "al2", assetId: "a2", holderType: "EMPLOYEE", holderId: "e7", allocatedById: "e3", allocatedOn: "2026-05-01", expectedReturn: "2026-07-08", returnedOn: null, status: "ACTIVE", checkInNotes: null },
  { id: "al3", assetId: "a9", holderType: "EMPLOYEE", holderId: "e8", allocatedById: "e3", allocatedOn: "2026-04-20", expectedReturn: null, returnedOn: null, status: "ACTIVE", checkInNotes: null },
  { id: "al4", assetId: "a14", holderType: "EMPLOYEE", holderId: "e1", allocatedById: "e3", allocatedOn: "2026-06-30", expectedReturn: "2026-07-11", returnedOn: null, status: "ACTIVE", checkInNotes: null },
  { id: "al5", assetId: "a13", holderType: "EMPLOYEE", holderId: "e6", allocatedById: "e3", allocatedOn: "2026-01-10", expectedReturn: "2026-03-10", returnedOn: "2026-03-08", status: "RETURNED", checkInNotes: "Returned in good condition." },
  { id: "al6", assetId: "a3", holderType: "DEPARTMENT", holderId: "d1", allocatedById: "e3", allocatedOn: "2025-11-02", expectedReturn: null, returnedOn: "2026-02-01", status: "RETURNED", checkInNotes: "Reassigned to shared pool." },
];

// --- Transfer requests --------------------------------------------------------
export const transfers = [
  { id: "t1", assetId: "a1", fromId: "e6", toId: "e7", requestedById: "e7", requestedOn: "2026-07-12", status: "REQUESTED", approvedById: null },
  { id: "t2", assetId: "a9", fromId: "e9", toId: "e8", requestedById: "e8", requestedOn: "2026-04-18", status: "REALLOCATED", approvedById: "e3" },
  { id: "t3", assetId: "a2", fromId: "e7", toId: "e6", requestedById: "e6", requestedOn: "2026-06-20", status: "REJECTED", approvedById: "e3" },
];

// --- Bookings (bookable assets: rooms + vehicles) -----------------------------
const curatedBookings = [
  { id: "b1", assetId: "a6", bookedById: "e6", start: "2026-07-13T09:00:00", end: "2026-07-13T10:00:00", status: "UPCOMING", purpose: "Sprint planning" },
  { id: "b2", assetId: "a6", bookedById: "e8", start: "2026-07-13T10:00:00", end: "2026-07-13T11:00:00", status: "UPCOMING", purpose: "Vendor call" },
  { id: "b3", assetId: "a6", bookedById: "e7", start: "2026-07-13T14:00:00", end: "2026-07-13T15:30:00", status: "UPCOMING", purpose: "QA sync" },
  { id: "b4", assetId: "a7", bookedById: "e2", start: "2026-07-13T09:15:00", end: "2026-07-13T10:30:00", status: "ONGOING", purpose: "Design review" },
  { id: "b5", assetId: "a4", bookedById: "e4", start: "2026-07-14T08:00:00", end: "2026-07-14T18:00:00", status: "UPCOMING", purpose: "Equipment delivery" },
  { id: "b6", assetId: "a11", bookedById: "e5", start: "2026-07-15T10:00:00", end: "2026-07-15T13:00:00", status: "UPCOMING", purpose: "Client visit" },
  { id: "b7", assetId: "a7", bookedById: "e6", start: "2026-07-10T11:00:00", end: "2026-07-10T12:00:00", status: "COMPLETED", purpose: "1:1" },
  { id: "b8", assetId: "a6", bookedById: "e9", start: "2026-07-11T15:00:00", end: "2026-07-11T16:00:00", status: "CANCELLED", purpose: "All-hands (cancelled)" },
];

// Generate a realistic spread of PAST bookings across weekday business hours so
// the Reports booking heatmap shows a meaningful pattern (peaks mid-morning &
// mid-afternoon, quiet on weekends). Deterministic via a fixed seed.
function generateBookingHistory() {
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const pad = (n) => String(n).padStart(2, "0");
  const res = ["a6", "a7", "a4", "a11"];
  const users = ["e6", "e7", "e8", "e2", "e5", "e9", "e4"];
  const purposes = ["Standup", "Client call", "Design review", "Interview", "Planning", "Delivery run", "1:1", "Workshop", "Vendor demo"];
  const peakHours = [9, 10, 10, 11, 11, 13, 14, 14, 15, 16];
  const out = [];
  let id = 200;
  const start = new Date("2026-06-22T00:00:00");
  for (let i = 0; i < 19; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    const ds = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const count = 2 + Math.floor(rand() * 3); // 2-4 per day
    const used = {};
    for (let j = 0; j < count; j++) {
      const h = peakHours[Math.floor(rand() * peakHours.length)];
      const asset = res[Math.floor(rand() * res.length)];
      const key = `${asset}-${h}`;
      if (used[key]) continue; // avoid double-booking same asset/hour
      used[key] = 1;
      const dur = 1 + Math.floor(rand() * 2);
      out.push({
        id: `bh${id++}`,
        assetId: asset,
        bookedById: users[Math.floor(rand() * users.length)],
        start: `${ds}T${pad(h)}:00:00`,
        end: `${ds}T${pad(h + dur)}:00:00`,
        status: "COMPLETED",
        purpose: purposes[Math.floor(rand() * purposes.length)],
      });
    }
  }
  return out;
}

export const bookings = [...curatedBookings, ...generateBookingHistory()];

// --- Maintenance requests -----------------------------------------------------
export const maintenance = [
  { id: "m1", assetId: "a5", raisedById: "e9", issue: "Lamp flickers and overheats after 20 minutes.", priority: "HIGH", status: "IN_PROGRESS", technician: "BrightFix Services", approvedById: "e3", raisedOn: "2026-07-06", photo: true },
  { id: "m2", assetId: "a1", raisedById: "e6", issue: "Battery drains within an hour; needs replacement.", priority: "MEDIUM", status: "PENDING", technician: null, approvedById: null, raisedOn: "2026-07-12", photo: false },
  { id: "m3", assetId: "a11", raisedById: "e5", issue: "Brake pads worn — scheduled service.", priority: "MEDIUM", status: "APPROVED", technician: null, approvedById: "e3", raisedOn: "2026-07-11", photo: false },
  { id: "m4", assetId: "a2", raisedById: "e7", issue: "Cracked screen corner.", priority: "LOW", status: "REJECTED", technician: null, approvedById: "e3", raisedOn: "2026-06-28", photo: true },
  { id: "m5", assetId: "a13", raisedById: "e6", issue: "Dead pixel cluster (resolved under warranty).", priority: "LOW", status: "RESOLVED", technician: "LG Care", approvedById: "e3", raisedOn: "2026-02-14", photo: false },
];

// --- Audit cycles + items -----------------------------------------------------
export const auditCycles = [
  {
    id: "au1",
    name: "Q3 Facilities Audit",
    scopeType: "DEPARTMENT",
    scopeLabel: "Facilities",
    startDate: "2026-07-10",
    endDate: "2026-07-20",
    status: "OPEN",
    auditorIds: ["e3", "e9"],
  },
  {
    id: "au2",
    name: "Q2 HQ Floor 3 Audit",
    scopeType: "LOCATION",
    scopeLabel: "HQ · Floor 3",
    startDate: "2026-04-01",
    endDate: "2026-04-10",
    status: "CLOSED",
    auditorIds: ["e3"],
  },
];

export const auditItems = [
  // au1 (open)
  { id: "ai1", cycleId: "au1", assetId: "a5", status: "DAMAGED", note: "Projector faulty — maintenance raised." },
  { id: "ai2", cycleId: "au1", assetId: "a6", status: "VERIFIED", note: null },
  { id: "ai3", cycleId: "au1", assetId: "a7", status: "PENDING", note: null },
  { id: "ai4", cycleId: "au1", assetId: "a12", status: "MISSING", note: "Not found at recorded location." },
  // au2 (closed)
  { id: "ai5", cycleId: "au2", assetId: "a1", status: "VERIFIED", note: null },
  { id: "ai6", cycleId: "au2", assetId: "a2", status: "VERIFIED", note: null },
  { id: "ai7", cycleId: "au2", assetId: "a13", status: "VERIFIED", note: null },
];

// --- Notifications ------------------------------------------------------------
export const notifications = [
  { id: "n1", userId: "e6", type: "TRANSFER", message: "Sara Khan requested a transfer of MacBook Pro 16\" (AF-0001).", createdAt: "2026-07-12T16:20:00", read: false },
  { id: "n2", userId: "e7", type: "OVERDUE", message: "Dell Latitude 7440 (AF-0002) is overdue for return.", createdAt: "2026-07-09T09:00:00", read: false },
  { id: "n3", userId: "e9", type: "MAINTENANCE", message: "Maintenance approved for Epson Projector (AF-0005).", createdAt: "2026-07-06T11:30:00", read: true },
  { id: "n4", userId: "e6", type: "BOOKING", message: "Booking confirmed: Conference Room B2, today 09:00–10:00.", createdAt: "2026-07-13T08:00:00", read: false },
  { id: "n5", userId: "e3", type: "AUDIT", message: "Audit discrepancy flagged: Label Printer (AF-0012) marked Missing.", createdAt: "2026-07-11T13:10:00", read: false },
  { id: "n6", userId: "e8", type: "ASSET", message: "Ergonomic Office Chair (AF-0009) was assigned to you.", createdAt: "2026-04-20T10:00:00", read: true },
];

// --- Activity log -------------------------------------------------------------
export const activityLog = [
  { id: "lg1", actorId: "e7", action: "Requested transfer of AF-0001", entity: "Transfer", createdAt: "2026-07-12T16:20:00" },
  { id: "lg2", actorId: "e3", action: "Approved maintenance for AF-0005", entity: "Maintenance", createdAt: "2026-07-06T11:30:00" },
  { id: "lg3", actorId: "e6", action: "Booked Conference Room B2 (09:00–10:00)", entity: "Booking", createdAt: "2026-07-13T08:00:00" },
  { id: "lg4", actorId: "e1", action: "Promoted Ananya Iyer to Asset Manager", entity: "Employee", createdAt: "2026-07-05T10:05:00" },
  { id: "lg5", actorId: "e3", action: "Registered asset AF-0013 (LG Monitor)", entity: "Asset", createdAt: "2026-07-04T14:40:00" },
  { id: "lg6", actorId: "e9", action: "Marked AF-0012 as Missing in Q3 Facilities Audit", entity: "Audit", createdAt: "2026-07-11T13:05:00" },
  { id: "lg7", actorId: "e3", action: "Allocated AF-0114 to Priya Sharma", entity: "Allocation", createdAt: "2026-06-30T09:20:00" },
];

// -----------------------------------------------------------------------------
// Lookup helpers
// -----------------------------------------------------------------------------
export const getEmployee = (id) => employees.find((e) => e.id === id);
export const getDepartment = (id) => departments.find((d) => d.id === id);
export const getCategory = (id) => categories.find((c) => c.id === id);
export const getAsset = (id) => assets.find((a) => a.id === id);
export const getAuditCycle = (id) => auditCycles.find((c) => c.id === id);

export const employeeName = (id) => getEmployee(id)?.name || "—";
export const departmentName = (id) => getDepartment(id)?.name || "—";
export const categoryName = (id) => getCategory(id)?.name || "—";

// Resolves an asset holder (employee OR department) to a display name.
export function holderName(holderType, holderId) {
  if (holderType === "EMPLOYEE") return employeeName(holderId);
  if (holderType === "DEPARTMENT") return departmentName(holderId);
  return "Unassigned";
}

// The active (not-yet-returned) allocation for an asset, if any.
export const activeAllocationForAsset = (assetId) =>
  allocations.find((al) => al.assetId === assetId && al.status === "ACTIVE");

export const bookingsForAsset = (assetId) =>
  bookings.filter((b) => b.assetId === assetId);

export const maintenanceForAsset = (assetId) =>
  maintenance.filter((m) => m.assetId === assetId);

export const allocationsForAsset = (assetId) =>
  allocations.filter((al) => al.assetId === assetId);

export const auditItemsForCycle = (cycleId) =>
  auditItems.filter((i) => i.cycleId === cycleId);

export const bookableAssets = () => assets.filter((a) => a.isBookable);
