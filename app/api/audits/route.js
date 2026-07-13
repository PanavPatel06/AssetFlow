import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireCapability } from "@/lib/apiAuth";
import { validate, auditCycleCreateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

const LIST_INCLUDE = {
  auditors: { select: { id: true, name: true } },
  _count: { select: { items: true } },
};

// GET /api/audits — list cycles.
export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const cycles = await prisma.auditCycle.findMany({
    include: LIST_INCLUDE,
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json({
    cycles: cycles.map((c) => ({ ...c, itemCount: c._count.items, _count: undefined })),
  });
}

// POST /api/audits — create a cycle: scope, date range, assigned auditors,
// and the set of assets in scope (each becomes a Pending AuditItem).
export async function POST(req) {
  const { user, error } = await requireCapability("runAudit");
  if (error) return error;

  const { data, error: validationError } = validate(auditCycleCreateSchema, await req.json());
  if (validationError) return validationError;

  const cycle = await prisma.auditCycle.create({
    data: {
      name: data.name,
      scopeType: data.scopeType,
      scopeLabel: data.scopeLabel,
      startDate: data.startDate,
      endDate: data.endDate,
      auditors: { connect: data.auditorIds.map((id) => ({ id })) },
      items: { create: data.assetIds.map((assetId) => ({ assetId })) },
    },
    include: {
      auditors: { select: { id: true, name: true } },
      items: { include: { asset: { select: { id: true, tag: true, name: true } } } },
    },
  });

  await logActivity({
    actorId: user.id,
    action: `Created audit cycle "${cycle.name}"`,
    entity: "Audit",
  });

  return NextResponse.json({ cycle }, { status: 201 });
}
