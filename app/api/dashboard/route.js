import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

// GET /api/dashboard — the aggregates Screen 2 needs in one round-trip:
// KPI counts, overdue vs. upcoming returns, and recent activity.
export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const organizationId = user.organizationId;
  const now = new Date();

  const [
    assetsAvailable,
    assetsAllocated,
    maintenanceActive,
    activeBookings,
    pendingTransfers,
    activeAllocations,
    recentActivity,
  ] = await Promise.all([
    prisma.asset.count({ where: { organizationId, status: "AVAILABLE" } }),
    prisma.asset.count({ where: { organizationId, status: "ALLOCATED" } }),
    prisma.maintenanceRequest.count({
      where: { organizationId, status: { in: ["PENDING", "APPROVED", "TECHNICIAN_ASSIGNED", "IN_PROGRESS"] } },
    }),
    prisma.booking.count({ where: { organizationId, status: { in: ["UPCOMING", "ONGOING"] } } }),
    prisma.transferRequest.count({ where: { organizationId, status: "REQUESTED" } }),
    prisma.allocation.findMany({
      where: { organizationId, status: "ACTIVE" },
      include: {
        asset: { select: { id: true, tag: true, name: true } },
        holderUser: { select: { id: true, name: true } },
        holderDepartment: { select: { id: true, name: true } },
      },
    }),
    prisma.activityLog.findMany({
      where: { organizationId },
      include: { actor: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const overdue = activeAllocations.filter((a) => a.expectedReturn && a.expectedReturn < now);
  const upcoming = activeAllocations
    .filter((a) => a.expectedReturn && a.expectedReturn >= now)
    .sort((a, b) => a.expectedReturn - b.expectedReturn);

  return NextResponse.json({
    kpis: {
      assetsAvailable,
      assetsAllocated,
      maintenanceActive,
      activeBookings,
      pendingTransfers,
      upcomingReturns: upcoming.length,
    },
    overdue,
    upcoming,
    recentActivity,
  });
}
