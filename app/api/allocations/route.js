import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireCapability } from "@/lib/apiAuth";
import { validate, allocationCreateSchema } from "@/lib/validation";
import { logActivity, notify } from "@/lib/activity";

const INCLUDE = {
  asset: { select: { id: true, tag: true, name: true } },
  holderUser: { select: { id: true, name: true } },
  holderDepartment: { select: { id: true, name: true } },
  allocatedBy: { select: { id: true, name: true } },
};

// GET /api/allocations?status=ACTIVE&assetId=...
export async function GET(req) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const assetId = searchParams.get("assetId");

  const allocations = await prisma.allocation.findMany({
    where: {
      organizationId: user.organizationId,
      ...(status ? { status } : {}),
      ...(assetId ? { assetId } : {}),
    },
    include: INCLUDE,
    orderBy: { allocatedOn: "desc" },
  });

  return NextResponse.json({ allocations });
}

// POST /api/allocations — the core conflict rule: you can't allocate an asset
// that's already actively held. If it is, respond 409 with the current
// holder so the caller can offer a Transfer Request instead.
export async function POST(req) {
  const { user, error } = await requireCapability("allocateAsset");
  if (error) return error;

  const { data, error: validationError } = validate(allocationCreateSchema, await req.json());
  if (validationError) return validationError;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findFirst({ where: { id: data.assetId, organizationId: user.organizationId } });
      if (!asset) {
        throw Object.assign(new Error("Asset not found."), { status: 404 });
      }

      const conflict = await tx.allocation.findFirst({
        where: { assetId: data.assetId, status: "ACTIVE" },
        include: {
          holderUser: { select: { id: true, name: true } },
          holderDepartment: { select: { id: true, name: true } },
        },
      });
      if (conflict) {
        const holderName = conflict.holderUser?.name || conflict.holderDepartment?.name;
        throw Object.assign(
          new Error(`This asset is currently held by ${holderName}.`),
          { status: 409, currentHolder: conflict }
        );
      }

      if (data.holderType === "EMPLOYEE") {
        const holder = await tx.user.findFirst({ where: { id: data.holderId, organizationId: user.organizationId } });
        if (!holder) throw Object.assign(new Error("Employee not found."), { status: 400 });
      } else {
        const holder = await tx.department.findFirst({ where: { id: data.holderId, organizationId: user.organizationId } });
        if (!holder) throw Object.assign(new Error("Department not found."), { status: 400 });
      }

      const allocation = await tx.allocation.create({
        data: {
          organizationId: user.organizationId,
          assetId: data.assetId,
          holderType: data.holderType,
          holderUserId: data.holderType === "EMPLOYEE" ? data.holderId : null,
          holderDepartmentId: data.holderType === "DEPARTMENT" ? data.holderId : null,
          allocatedById: user.id,
          expectedReturn: data.expectedReturn ?? null,
        },
        include: INCLUDE,
      });

      await tx.asset.update({
        where: { id: data.assetId },
        data: {
          status: data.holderType === "EMPLOYEE" ? "ALLOCATED" : "RESERVED",
          currentHolderType: data.holderType,
          currentHolderUserId: data.holderType === "EMPLOYEE" ? data.holderId : null,
          currentHolderDepartmentId: data.holderType === "DEPARTMENT" ? data.holderId : null,
        },
      });

      return allocation;
    });

    await logActivity({
      organizationId: user.organizationId,
      actorId: user.id,
      action: `Allocated ${result.asset.tag} (${result.asset.name}) to ${
        result.holderUser?.name || result.holderDepartment?.name
      }`,
      entity: "Allocation",
    });
    if (result.holderUserId) {
      await notify({
        userId: result.holderUserId,
        type: "ASSET",
        message: `${result.asset.name} (${result.asset.tag}) was assigned to you.`,
      });
    }

    return NextResponse.json({ allocation: result }, { status: 201 });
  } catch (e) {
    if (e.status === 409) {
      return NextResponse.json(
        { error: e.message, currentHolder: e.currentHolder },
        { status: 409 }
      );
    }
    if (e.status) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
