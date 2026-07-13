import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/apiAuth";
import { validate, allocationReturnSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

// POST /api/allocations/[id]/return — mark returned, capture condition
// check-in notes, asset status reverts to Available.
export async function POST(req, { params }) {
  const { user, error } = await requireCapability("allocateAsset");
  if (error) return error;

  const { id } = await params;
  const { data, error: validationError } = validate(allocationReturnSchema, await req.json().catch(() => ({})));
  if (validationError) return validationError;

  const allocation = await prisma.allocation.findUnique({ where: { id }, include: { asset: true } });
  if (!allocation) {
    return NextResponse.json({ error: "Allocation not found." }, { status: 404 });
  }
  if (allocation.status !== "ACTIVE") {
    return NextResponse.json({ error: "This allocation has already been returned." }, { status: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.allocation.update({
      where: { id },
      data: {
        status: "RETURNED",
        returnedOn: new Date(),
        checkInNotes: data.checkInNotes ?? null,
      },
    }),
    prisma.asset.update({
      where: { id: allocation.assetId },
      data: {
        status: "AVAILABLE",
        currentHolderType: null,
        currentHolderUserId: null,
        currentHolderDepartmentId: null,
      },
    }),
  ]);

  await logActivity({
    actorId: user.id,
    action: `Returned ${allocation.asset.tag} (${allocation.asset.name})`,
    entity: "Allocation",
  });

  return NextResponse.json({ allocation: updated });
}
