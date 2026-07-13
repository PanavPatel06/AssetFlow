import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import { validate, transferCreateSchema } from "@/lib/validation";
import { logActivity, notify } from "@/lib/activity";

const INCLUDE = {
  asset: { select: { id: true, tag: true, name: true } },
  fromUser: { select: { id: true, name: true } },
  toUser: { select: { id: true, name: true } },
  requestedBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
};

// GET /api/transfers?status=REQUESTED&assetId=...
export async function GET(req) {
  const { error } = await requireUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const assetId = searchParams.get("assetId");

  const transfers = await prisma.transferRequest.findMany({
    where: { ...(status ? { status } : {}), ...(assetId ? { assetId } : {}) },
    include: INCLUDE,
    orderBy: { requestedOn: "desc" },
  });
  return NextResponse.json({ transfers });
}

// POST /api/transfers — request a transfer. This is the alternative offered
// when a direct allocation is blocked because the asset is already held by
// another employee.
export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { data, error: validationError } = validate(transferCreateSchema, await req.json());
  if (validationError) return validationError;

  const activeAllocation = await prisma.allocation.findFirst({
    where: { assetId: data.assetId, status: "ACTIVE", holderType: "EMPLOYEE" },
    include: { asset: { select: { id: true, tag: true, name: true } } },
  });
  if (!activeAllocation) {
    return NextResponse.json(
      { error: "This asset isn't currently allocated to an employee, so no transfer applies." },
      { status: 400 }
    );
  }

  const toUser = await prisma.user.findUnique({ where: { id: data.toUserId } });
  if (!toUser) {
    return NextResponse.json({ error: "Target employee not found." }, { status: 400 });
  }

  const transfer = await prisma.transferRequest.create({
    data: {
      assetId: data.assetId,
      fromUserId: activeAllocation.holderUserId,
      toUserId: data.toUserId,
      requestedById: user.id,
    },
    include: INCLUDE,
  });

  await logActivity({
    actorId: user.id,
    action: `Requested transfer of ${activeAllocation.asset.tag}`,
    entity: "Transfer",
  });
  await notify({
    userId: activeAllocation.holderUserId,
    type: "TRANSFER",
    message: `${toUser.name} requested a transfer of ${activeAllocation.asset.name} (${activeAllocation.asset.tag}).`,
  });

  return NextResponse.json({ transfer }, { status: 201 });
}
