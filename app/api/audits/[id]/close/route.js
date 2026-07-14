import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/apiAuth";
import { logActivity, notifyMany } from "@/lib/activity";

// POST /api/audits/[id]/close — locks the cycle and updates affected asset
// statuses (confirmed-missing items → Lost).
export async function POST(req, { params }) {
  const { user, error } = await requireCapability("runAudit");
  if (error) return error;

  const { id } = await params;
  const cycle = await prisma.auditCycle.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      auditors: { select: { id: true } },
      items: { include: { asset: { select: { id: true, tag: true, name: true } } } },
    },
  });
  if (!cycle) {
    return NextResponse.json({ error: "Audit cycle not found." }, { status: 404 });
  }
  if (cycle.status === "CLOSED") {
    return NextResponse.json({ error: "This audit cycle is already closed." }, { status: 400 });
  }

  const missingItems = cycle.items.filter((i) => i.status === "MISSING");
  const discrepancies = cycle.items.filter((i) => i.status === "MISSING" || i.status === "DAMAGED");

  const updated = await prisma.$transaction(async (tx) => {
    for (const item of missingItems) {
      await tx.asset.update({ where: { id: item.assetId }, data: { status: "LOST" } });
    }
    return tx.auditCycle.update({
      where: { id },
      data: { status: "CLOSED" },
      include: {
        auditors: { select: { id: true, name: true } },
        items: { include: { asset: { select: { id: true, tag: true, name: true } } } },
      },
    });
  });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Closed audit cycle "${cycle.name}"${missingItems.length ? ` — ${missingItems.length} asset(s) marked Lost` : ""}`,
    entity: "Audit",
  });

  for (const item of discrepancies) {
    await notifyMany(cycle.auditors.map((a) => a.id), {
      type: "AUDIT",
      message: `Audit discrepancy flagged: ${item.asset.name} (${item.asset.tag}) marked ${item.status}.`,
    });
  }

  return NextResponse.json({ cycle: updated });
}
