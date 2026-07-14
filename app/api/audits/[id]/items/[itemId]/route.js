import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/apiAuth";
import { validate, auditItemMarkSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

// PATCH /api/audits/[id]/items/[itemId] — auditor marks an asset
// Verified / Missing / Damaged. Locked once the cycle is closed.
export async function PATCH(req, { params }) {
  const { user, error } = await requireCapability("runAudit");
  if (error) return error;

  const { id, itemId } = await params;
  const { data, error: validationError } = validate(auditItemMarkSchema, await req.json());
  if (validationError) return validationError;

  const item = await prisma.auditItem.findUnique({
    where: { id: itemId },
    include: { cycle: true, asset: { select: { id: true, tag: true, name: true } } },
  });
  if (!item || item.cycleId !== id || item.cycle.organizationId !== user.organizationId) {
    return NextResponse.json({ error: "Audit item not found." }, { status: 404 });
  }
  if (item.cycle.status === "CLOSED") {
    return NextResponse.json({ error: "This audit cycle is closed and locked." }, { status: 400 });
  }

  const updated = await prisma.auditItem.update({
    where: { id: itemId },
    data: { status: data.status, note: data.note ?? null },
  });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Marked ${item.asset.tag} as ${data.status} in "${item.cycle.name}"`,
    entity: "Audit",
  });

  return NextResponse.json({ item: updated });
}
