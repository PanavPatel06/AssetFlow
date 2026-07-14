import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/apiAuth";
import { validate, transferDecisionSchema } from "@/lib/validation";
import { logActivity, notify } from "@/lib/activity";

// PATCH /api/transfers/[id] — approve or reject. Transfer workflow:
// Requested → Approved (Re-allocated, history updated automatically) / Rejected.
export async function PATCH(req, { params }) {
  const { user, error } = await requireCapability("approveTransfer");
  if (error) return error;

  const { id } = await params;
  const { data, error: validationError } = validate(transferDecisionSchema, await req.json());
  if (validationError) return validationError;

  const transfer = await prisma.transferRequest.findFirst({
    where: { id, organizationId: user.organizationId },
    include: { asset: { select: { id: true, tag: true, name: true } } },
  });
  if (!transfer) {
    return NextResponse.json({ error: "Transfer request not found." }, { status: 404 });
  }
  if (transfer.status !== "REQUESTED") {
    return NextResponse.json({ error: "This transfer has already been decided." }, { status: 400 });
  }

  if (data.decision === "REJECTED") {
    const updated = await prisma.transferRequest.update({
      where: { id },
      data: { status: "REJECTED", approvedById: user.id },
    });
    await logActivity({
      organizationId: user.organizationId,
      actorId: user.id,
      action: `Rejected transfer of ${transfer.asset.tag}`,
      entity: "Transfer",
    });
    await notify({
      userId: transfer.requestedById,
      type: "TRANSFER",
      message: `Your transfer request for ${transfer.asset.name} (${transfer.asset.tag}) was rejected.`,
    });
    return NextResponse.json({ transfer: updated });
  }

  // APPROVED — reallocate: close out the old allocation, open a new one, and
  // move the asset's current-holder pointer. History updates automatically.
  const result = await prisma.$transaction(async (tx) => {
    const oldAllocation = await tx.allocation.findFirst({
      where: { assetId: transfer.assetId, holderUserId: transfer.fromUserId, status: "ACTIVE" },
    });
    if (oldAllocation) {
      await tx.allocation.update({
        where: { id: oldAllocation.id },
        data: { status: "RETURNED", returnedOn: new Date(), checkInNotes: "Reassigned via approved transfer." },
      });
    }

    await tx.allocation.create({
      data: {
        organizationId: user.organizationId,
        assetId: transfer.assetId,
        holderType: "EMPLOYEE",
        holderUserId: transfer.toUserId,
        allocatedById: user.id,
        expectedReturn: oldAllocation?.expectedReturn ?? null,
      },
    });

    await tx.asset.update({
      where: { id: transfer.assetId },
      data: { currentHolderUserId: transfer.toUserId, status: "ALLOCATED" },
    });

    return tx.transferRequest.update({
      where: { id },
      data: { status: "REALLOCATED", approvedById: user.id },
    });
  });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Approved transfer of ${transfer.asset.tag}`,
    entity: "Transfer",
  });
  await notify({
    userId: transfer.toUserId,
    type: "TRANSFER",
    message: `${transfer.asset.name} (${transfer.asset.tag}) was transferred to you.`,
  });

  return NextResponse.json({ transfer: result });
}
