// AssetFlow — database seed.
//
// Mirrors the Phase 1 mock data (lib/mockData.js) as closely as possible —
// same names, same scenario — so the two look/feel identical once Phase 3
// swaps the frontend from mock data to this real database.
//
// Run with: npm run db:seed  (or automatically after `prisma migrate reset`)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// All seed users share this password so you can log in as anyone locally.
const SEED_PASSWORD = "password123";

function d(dateStr) {
  return new Date(dateStr);
}

async function main() {
  console.log("Seeding AssetFlow database...");
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  // --- Organization ("tenant") this scenario belongs to. A second, much
  // smaller organization is seeded further down to demonstrate that its
  // data never mixes with this one's. -------------------------------------
  const acme = await prisma.organization.create({ data: { name: "Acme Inc", slug: "acme" } });
  const organizationId = acme.id;

  // --- Pass 1: Departments (no head/parent yet, to avoid circular FKs) -----
  const deptSeed = [
    { key: "d1", name: "Engineering", status: "ACTIVE" },
    { key: "d2", name: "Operations", status: "ACTIVE" },
    { key: "d3", name: "Facilities", status: "ACTIVE" },
    { key: "d4", name: "Finance", status: "ACTIVE" },
    { key: "d5", name: "Field Sales", status: "INACTIVE" },
  ];
  const dept = {};
  for (const dep of deptSeed) {
    dept[dep.key] = await prisma.department.create({
      data: { organizationId, name: dep.name, status: dep.status },
    });
  }

  // --- Pass 2: Users (can now reference department ids) --------------------
  const userSeed = [
    { key: "e1", name: "Priya Sharma", email: "priya@acme.com", deptKey: "d2", role: "ADMIN", title: "System Administrator" },
    { key: "e2", name: "Raj Patel", email: "raj@acme.com", deptKey: "d1", role: "DEPARTMENT_HEAD", title: "Head of Engineering" },
    { key: "e3", name: "Ananya Iyer", email: "ananya@acme.com", deptKey: "d2", role: "ASSET_MANAGER", title: "Asset Manager" },
    { key: "e4", name: "Vikram Singh", email: "vikram@acme.com", deptKey: "d3", role: "DEPARTMENT_HEAD", title: "Facilities Lead" },
    { key: "e5", name: "Meera Nair", email: "meera@acme.com", deptKey: "d4", role: "DEPARTMENT_HEAD", title: "Finance Lead" },
    { key: "e6", name: "Arjun Rao", email: "arjun@acme.com", deptKey: "d1", role: "EMPLOYEE", title: "Software Engineer" },
    { key: "e7", name: "Sara Khan", email: "sara@acme.com", deptKey: "d1", role: "EMPLOYEE", title: "QA Engineer" },
    { key: "e8", name: "Dev Mehta", email: "dev@acme.com", deptKey: "d2", role: "EMPLOYEE", title: "Ops Associate" },
    { key: "e9", name: "Nisha Gupta", email: "nisha@acme.com", deptKey: "d3", role: "EMPLOYEE", title: "Facilities Coordinator" },
    { key: "e10", name: "Karan Joshi", email: "karan@acme.com", deptKey: "d4", role: "EMPLOYEE", title: "Accounts Assistant", status: "INACTIVE" },
  ];
  const user = {};
  for (const u of userSeed) {
    user[u.key] = await prisma.user.create({
      data: {
        organizationId,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        title: u.title,
        status: u.status || "ACTIVE",
        departmentId: dept[u.deptKey].id,
      },
    });
  }

  // --- Pass 3: back-fill department heads + hierarchy -----------------------
  await prisma.department.update({ where: { id: dept.d1.id }, data: { headId: user.e2.id } });
  await prisma.department.update({ where: { id: dept.d2.id }, data: { headId: user.e3.id } });
  await prisma.department.update({ where: { id: dept.d3.id }, data: { headId: user.e4.id, parentId: dept.d2.id } });
  await prisma.department.update({ where: { id: dept.d4.id }, data: { headId: user.e5.id } });
  await prisma.department.update({ where: { id: dept.d5.id }, data: { parentId: dept.d2.id } });

  // --- Asset categories ------------------------------------------------------
  const catSeed = [
    { key: "c1", name: "Electronics", customFields: ["Warranty Period", "Voltage"] },
    { key: "c2", name: "Furniture", customFields: [] },
    { key: "c3", name: "Vehicles", customFields: ["Registration No.", "Fuel Type"] },
    { key: "c4", name: "Equipment", customFields: ["Warranty Period"] },
    { key: "c5", name: "Rooms", customFields: ["Capacity"] },
  ];
  const cat = {};
  for (const c of catSeed) {
    cat[c.key] = await prisma.assetCategory.create({
      data: { organizationId, name: c.name, customFields: c.customFields },
    });
  }

  // --- Assets ------------------------------------------------------------
  const assetSeed = [
    { key: "a1", tag: "AF-0001", name: 'MacBook Pro 16"', catKey: "c1", serial: "C02FP-2291", acquisitionDate: "2024-03-11", acquisitionCost: 2400, condition: "Good", location: "HQ · Floor 3", isBookable: false, status: "ALLOCATED", holderType: "EMPLOYEE", holderKey: "e6" },
    { key: "a2", tag: "AF-0002", name: "Dell Latitude 7440", catKey: "c1", serial: "DL7440-8821", acquisitionDate: "2023-09-02", acquisitionCost: 1500, condition: "Fair", location: "HQ · Floor 3", isBookable: false, status: "ALLOCATED", holderType: "EMPLOYEE", holderKey: "e7" },
    { key: "a3", tag: "AF-0003", name: "Standing Desk Pro", catKey: "c2", serial: "SD-1042", acquisitionDate: "2022-06-18", acquisitionCost: 600, condition: "Good", location: "HQ · Floor 2", isBookable: false, status: "AVAILABLE" },
    { key: "a4", tag: "AF-0004", name: "Toyota Hiace Van", catKey: "c3", serial: "MH02-VN-4412", acquisitionDate: "2021-01-20", acquisitionCost: 32000, condition: "Good", location: "Depot · Bay 1", isBookable: true, status: "AVAILABLE" },
    { key: "a5", tag: "AF-0005", name: "Epson Projector EB-2250U", catKey: "c4", serial: "EP-2250-771", acquisitionDate: "2022-11-05", acquisitionCost: 900, condition: "Poor", location: "HQ · Floor 1", isBookable: false, status: "UNDER_MAINTENANCE" },
    { key: "a6", tag: "AF-0006", name: "Conference Room B2", catKey: "c5", serial: "ROOM-B2", acquisitionDate: "2020-01-01", acquisitionCost: 0, condition: "Good", location: "HQ · Floor 2", isBookable: true, status: "AVAILABLE" },
    { key: "a7", tag: "AF-0007", name: "Conference Room A1", catKey: "c5", serial: "ROOM-A1", acquisitionDate: "2020-01-01", acquisitionCost: 0, condition: "Good", location: "HQ · Floor 1", isBookable: true, status: "AVAILABLE" },
    { key: "a8", tag: "AF-0008", name: 'iPad Pro 12.9"', catKey: "c1", serial: "IPD-9930", acquisitionDate: "2023-04-14", acquisitionCost: 1100, condition: "Good", location: "HQ · Floor 3", isBookable: false, status: "RESERVED", holderType: "DEPARTMENT", holderKey: "d1" },
    { key: "a9", tag: "AF-0009", name: "Ergonomic Office Chair", catKey: "c2", serial: "CH-ERG-220", acquisitionDate: "2022-08-30", acquisitionCost: 450, condition: "Good", location: "HQ · Floor 2", isBookable: false, status: "ALLOCATED", holderType: "EMPLOYEE", holderKey: "e8" },
    { key: "a10", tag: "AF-0010", name: "Warehouse Forklift", catKey: "c4", serial: "FL-9921", acquisitionDate: "2018-05-12", acquisitionCost: 18000, condition: "Retired", location: "Depot · Bay 3", isBookable: false, status: "RETIRED" },
    { key: "a11", tag: "AF-0011", name: "Honda City Sedan", catKey: "c3", serial: "MH02-SD-1180", acquisitionDate: "2022-02-11", acquisitionCost: 21000, condition: "Good", location: "Depot · Bay 2", isBookable: true, status: "AVAILABLE" },
    { key: "a12", tag: "AF-0012", name: "Brother Label Printer", catKey: "c4", serial: "BR-LP-330", acquisitionDate: "2023-07-19", acquisitionCost: 220, condition: "Unknown", location: "HQ · Floor 1", isBookable: false, status: "LOST" },
    { key: "a13", tag: "AF-0013", name: 'LG UltraFine 27" Monitor', catKey: "c1", serial: "LG-27UF-556", acquisitionDate: "2024-01-08", acquisitionCost: 500, condition: "Good", location: "HQ · Floor 3", isBookable: false, status: "AVAILABLE" },
    { key: "a14", tag: "AF-0114", name: "ThinkPad X1 Carbon", catKey: "c1", serial: "TP-X1-0114", acquisitionDate: "2023-12-01", acquisitionCost: 1700, condition: "Good", location: "HQ · Floor 2", isBookable: false, status: "ALLOCATED", holderType: "EMPLOYEE", holderKey: "e1" },
  ];
  const asset = {};
  for (const a of assetSeed) {
    asset[a.key] = await prisma.asset.create({
      data: {
        organizationId,
        tag: a.tag,
        name: a.name,
        categoryId: cat[a.catKey].id,
        serial: a.serial,
        acquisitionDate: d(a.acquisitionDate),
        acquisitionCost: a.acquisitionCost,
        condition: a.condition,
        location: a.location,
        isBookable: a.isBookable,
        status: a.status,
        currentHolderType: a.holderType || null,
        currentHolderUserId: a.holderType === "EMPLOYEE" ? user[a.holderKey].id : null,
        currentHolderDepartmentId: a.holderType === "DEPARTMENT" ? dept[a.holderKey].id : null,
      },
    });
  }

  // --- Allocations (active + returned history) ------------------------------
  const allocationSeed = [
    { assetKey: "a1", holderType: "EMPLOYEE", holderKey: "e6", allocatedByKey: "e3", allocatedOn: "2026-06-15", expectedReturn: "2026-08-15", status: "ACTIVE" },
    { assetKey: "a2", holderType: "EMPLOYEE", holderKey: "e7", allocatedByKey: "e3", allocatedOn: "2026-05-01", expectedReturn: "2026-07-08", status: "ACTIVE" },
    { assetKey: "a9", holderType: "EMPLOYEE", holderKey: "e8", allocatedByKey: "e3", allocatedOn: "2026-04-20", status: "ACTIVE" },
    { assetKey: "a14", holderType: "EMPLOYEE", holderKey: "e1", allocatedByKey: "e3", allocatedOn: "2026-06-30", expectedReturn: "2026-07-11", status: "ACTIVE" },
    { assetKey: "a8", holderType: "DEPARTMENT", holderKey: "d1", allocatedByKey: "e3", allocatedOn: "2026-06-01", status: "ACTIVE" },
    { assetKey: "a13", holderType: "EMPLOYEE", holderKey: "e6", allocatedByKey: "e3", allocatedOn: "2026-01-10", expectedReturn: "2026-03-10", returnedOn: "2026-03-08", status: "RETURNED", checkInNotes: "Returned in good condition." },
    { assetKey: "a3", holderType: "DEPARTMENT", holderKey: "d1", allocatedByKey: "e3", allocatedOn: "2025-11-02", returnedOn: "2026-02-01", status: "RETURNED", checkInNotes: "Reassigned to shared pool." },
  ];
  for (const al of allocationSeed) {
    await prisma.allocation.create({
      data: {
        organizationId,
        assetId: asset[al.assetKey].id,
        holderType: al.holderType,
        holderUserId: al.holderType === "EMPLOYEE" ? user[al.holderKey].id : null,
        holderDepartmentId: al.holderType === "DEPARTMENT" ? dept[al.holderKey].id : null,
        allocatedById: user[al.allocatedByKey].id,
        allocatedOn: d(al.allocatedOn),
        expectedReturn: al.expectedReturn ? d(al.expectedReturn) : null,
        returnedOn: al.returnedOn ? d(al.returnedOn) : null,
        status: al.status,
        checkInNotes: al.checkInNotes || null,
      },
    });
  }

  // --- Transfer requests -----------------------------------------------------
  const transferSeed = [
    { assetKey: "a1", fromKey: "e6", toKey: "e7", requestedByKey: "e7", requestedOn: "2026-07-12", status: "REQUESTED" },
    { assetKey: "a9", fromKey: "e9", toKey: "e8", requestedByKey: "e8", requestedOn: "2026-04-18", status: "REALLOCATED", approvedByKey: "e3" },
    { assetKey: "a2", fromKey: "e7", toKey: "e6", requestedByKey: "e6", requestedOn: "2026-06-20", status: "REJECTED", approvedByKey: "e3" },
  ];
  for (const t of transferSeed) {
    await prisma.transferRequest.create({
      data: {
        organizationId,
        assetId: asset[t.assetKey].id,
        fromUserId: user[t.fromKey].id,
        toUserId: user[t.toKey].id,
        requestedById: user[t.requestedByKey].id,
        requestedOn: d(t.requestedOn),
        status: t.status,
        approvedById: t.approvedByKey ? user[t.approvedByKey].id : null,
      },
    });
  }

  // --- Bookings ----------------------------------------------------------
  const bookingSeed = [
    { assetKey: "a6", bookedByKey: "e6", start: "2026-07-13T09:00:00", end: "2026-07-13T10:00:00", status: "UPCOMING", purpose: "Sprint planning" },
    { assetKey: "a6", bookedByKey: "e8", start: "2026-07-13T10:00:00", end: "2026-07-13T11:00:00", status: "UPCOMING", purpose: "Vendor call" },
    { assetKey: "a6", bookedByKey: "e7", start: "2026-07-13T14:00:00", end: "2026-07-13T15:30:00", status: "UPCOMING", purpose: "QA sync" },
    { assetKey: "a7", bookedByKey: "e2", start: "2026-07-13T09:15:00", end: "2026-07-13T10:30:00", status: "ONGOING", purpose: "Design review" },
    { assetKey: "a4", bookedByKey: "e4", start: "2026-07-14T08:00:00", end: "2026-07-14T18:00:00", status: "UPCOMING", purpose: "Equipment delivery" },
    { assetKey: "a11", bookedByKey: "e5", start: "2026-07-15T10:00:00", end: "2026-07-15T13:00:00", status: "UPCOMING", purpose: "Client visit" },
    { assetKey: "a7", bookedByKey: "e6", start: "2026-07-10T11:00:00", end: "2026-07-10T12:00:00", status: "COMPLETED", purpose: "1:1" },
    { assetKey: "a6", bookedByKey: "e9", start: "2026-07-11T15:00:00", end: "2026-07-11T16:00:00", status: "CANCELLED", purpose: "All-hands (cancelled)" },
  ];
  for (const b of bookingSeed) {
    await prisma.booking.create({
      data: {
        organizationId,
        assetId: asset[b.assetKey].id,
        bookedById: user[b.bookedByKey].id,
        start: d(b.start),
        end: d(b.end),
        status: b.status,
        purpose: b.purpose,
      },
    });
  }

  // --- Maintenance requests -----------------------------------------------
  const maintenanceSeed = [
    { assetKey: "a5", raisedByKey: "e9", issue: "Lamp flickers and overheats after 20 minutes.", priority: "HIGH", status: "IN_PROGRESS", technician: "BrightFix Services", approvedByKey: "e3", raisedOn: "2026-07-06" },
    { assetKey: "a1", raisedByKey: "e6", issue: "Battery drains within an hour; needs replacement.", priority: "MEDIUM", status: "PENDING", raisedOn: "2026-07-12" },
    { assetKey: "a11", raisedByKey: "e5", issue: "Brake pads worn — scheduled service.", priority: "MEDIUM", status: "APPROVED", approvedByKey: "e3", raisedOn: "2026-07-11" },
    { assetKey: "a2", raisedByKey: "e7", issue: "Cracked screen corner.", priority: "LOW", status: "REJECTED", approvedByKey: "e3", raisedOn: "2026-06-28" },
    { assetKey: "a13", raisedByKey: "e6", issue: "Dead pixel cluster (resolved under warranty).", priority: "LOW", status: "RESOLVED", technician: "LG Care", approvedByKey: "e3", raisedOn: "2026-02-14" },
  ];
  for (const m of maintenanceSeed) {
    await prisma.maintenanceRequest.create({
      data: {
        organizationId,
        assetId: asset[m.assetKey].id,
        raisedById: user[m.raisedByKey].id,
        issue: m.issue,
        priority: m.priority,
        status: m.status,
        technician: m.technician || null,
        approvedById: m.approvedByKey ? user[m.approvedByKey].id : null,
        raisedOn: d(m.raisedOn),
      },
    });
  }

  // --- Audit cycles + items --------------------------------------------------
  const au1 = await prisma.auditCycle.create({
    data: {
      organizationId,
      name: "Q3 Facilities Audit",
      scopeType: "DEPARTMENT",
      scopeLabel: "Facilities",
      startDate: d("2026-07-10"),
      endDate: d("2026-07-20"),
      status: "OPEN",
      auditors: { connect: [{ id: user.e3.id }, { id: user.e9.id }] },
    },
  });
  const au2 = await prisma.auditCycle.create({
    data: {
      organizationId,
      name: "Q2 HQ Floor 3 Audit",
      scopeType: "LOCATION",
      scopeLabel: "HQ · Floor 3",
      startDate: d("2026-04-01"),
      endDate: d("2026-04-10"),
      status: "CLOSED",
      auditors: { connect: [{ id: user.e3.id }] },
    },
  });

  const auditItemSeed = [
    { cycle: au1, assetKey: "a5", status: "DAMAGED", note: "Projector faulty — maintenance raised." },
    { cycle: au1, assetKey: "a6", status: "VERIFIED" },
    { cycle: au1, assetKey: "a7", status: "PENDING" },
    { cycle: au1, assetKey: "a12", status: "MISSING", note: "Not found at recorded location." },
    { cycle: au2, assetKey: "a1", status: "VERIFIED" },
    { cycle: au2, assetKey: "a2", status: "VERIFIED" },
    { cycle: au2, assetKey: "a13", status: "VERIFIED" },
  ];
  for (const i of auditItemSeed) {
    await prisma.auditItem.create({
      data: {
        cycleId: i.cycle.id,
        assetId: asset[i.assetKey].id,
        status: i.status,
        note: i.note || null,
      },
    });
  }

  // --- Notifications -------------------------------------------------------
  const notificationSeed = [
    { userKey: "e6", type: "TRANSFER", message: 'Sara Khan requested a transfer of MacBook Pro 16" (AF-0001).', createdAt: "2026-07-12T16:20:00", read: false },
    { userKey: "e7", type: "OVERDUE", message: "Dell Latitude 7440 (AF-0002) is overdue for return.", createdAt: "2026-07-09T09:00:00", read: false },
    { userKey: "e9", type: "MAINTENANCE", message: "Maintenance approved for Epson Projector (AF-0005).", createdAt: "2026-07-06T11:30:00", read: true },
    { userKey: "e6", type: "BOOKING", message: "Booking confirmed: Conference Room B2, today 09:00–10:00.", createdAt: "2026-07-13T08:00:00", read: false },
    { userKey: "e3", type: "AUDIT", message: "Audit discrepancy flagged: Label Printer (AF-0012) marked Missing.", createdAt: "2026-07-11T13:10:00", read: false },
    { userKey: "e8", type: "ASSET", message: "Ergonomic Office Chair (AF-0009) was assigned to you.", createdAt: "2026-04-20T10:00:00", read: true },
  ];
  for (const n of notificationSeed) {
    await prisma.notification.create({
      data: {
        userId: user[n.userKey].id,
        type: n.type,
        message: n.message,
        read: n.read,
        createdAt: d(n.createdAt),
      },
    });
  }

  // --- Activity log ----------------------------------------------------------
  const activitySeed = [
    { actorKey: "e7", action: "Requested transfer of AF-0001", entity: "Transfer", createdAt: "2026-07-12T16:20:00" },
    { actorKey: "e3", action: "Approved maintenance for AF-0005", entity: "Maintenance", createdAt: "2026-07-06T11:30:00" },
    { actorKey: "e6", action: "Booked Conference Room B2 (09:00–10:00)", entity: "Booking", createdAt: "2026-07-13T08:00:00" },
    { actorKey: "e1", action: "Promoted Ananya Iyer to Asset Manager", entity: "Employee", createdAt: "2026-07-05T10:05:00" },
    { actorKey: "e3", action: "Registered asset AF-0013 (LG Monitor)", entity: "Asset", createdAt: "2026-07-04T14:40:00" },
    { actorKey: "e9", action: "Marked AF-0012 as Missing in Q3 Facilities Audit", entity: "Audit", createdAt: "2026-07-11T13:05:00" },
    { actorKey: "e3", action: "Allocated AF-0114 to Priya Sharma", entity: "Allocation", createdAt: "2026-06-30T09:20:00" },
  ];
  for (const l of activitySeed) {
    await prisma.activityLog.create({
      data: {
        organizationId,
        actorId: user[l.actorKey].id,
        action: l.action,
        entity: l.entity,
        createdAt: d(l.createdAt),
      },
    });
  }

  // --- A second, much smaller organization ("tenant") ------------------------
  // Proves the multi-tenant boundary actually holds: log in as its Admin and
  // every screen should show only this data — none of Acme's — and vice versa.
  const globex = await prisma.organization.create({ data: { name: "Globex Industries", slug: "globex" } });
  const globexDept = await prisma.department.create({
    data: { organizationId: globex.id, name: "Operations", status: "ACTIVE" },
  });
  const globexAdmin = await prisma.user.create({
    data: {
      organizationId: globex.id,
      name: "Casey Morgan",
      email: "casey@globex.example",
      passwordHash,
      role: "ADMIN",
      title: "System Administrator",
      departmentId: globexDept.id,
    },
  });
  const globexCategory = await prisma.assetCategory.create({
    data: { organizationId: globex.id, name: "Electronics", customFields: [] },
  });
  await prisma.asset.create({
    data: {
      organizationId: globex.id,
      tag: "AF-0001", // same tag as Acme's first asset — proves tags are scoped per organization, not global
      name: "ThinkPad T14",
      categoryId: globexCategory.id,
      condition: "Good",
      location: "HQ",
      isBookable: false,
      status: "AVAILABLE",
    },
  });

  console.log("Seed complete.");
  console.log(`All seed users share the password: "${SEED_PASSWORD}"`);
  console.log(`Organization "Acme Inc" (code: ${acme.slug}) — sign in as priya@acme.com`);
  console.log(`Organization "Globex Industries" (code: ${globex.slug}) — sign in as ${globexAdmin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
