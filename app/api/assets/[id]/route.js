import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireCapability } from "@/lib/apiAuth";
import { validate, assetUpdateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

// GET /api/assets/[id] — detail plus allocation + maintenance history.
export async function GET(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const asset = await prisma.asset.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      category: { select: { id: true, name: true } },
      currentHolderUser: { select: { id: true, name: true } },
      currentHolderDepartment: { select: { id: true, name: true } },
      allocations: {
        orderBy: { allocatedOn: "desc" },
        include: {
          holderUser: { select: { id: true, name: true } },
          holderDepartment: { select: { id: true, name: true } },
        },
      },
      maintenance: {
        orderBy: { raisedOn: "desc" },
        include: { raisedBy: { select: { id: true, name: true } } },
      },
    },
  });
  if (!asset) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }
  return NextResponse.json({ asset });
}

// PATCH — edit asset details (Asset Manager / Admin only). Status is never
// accepted here — it only changes via the workflow action endpoints.
export async function PATCH(req, { params }) {
  const { user, error } = await requireCapability("registerAsset");
  if (error) return error;

  const { id } = await params;
  const { data, error: validationError } = validate(assetUpdateSchema, await req.json());
  if (validationError) return validationError;

  const existing = await prisma.asset.findFirst({ where: { id, organizationId: user.organizationId } });
  if (!existing) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  if (data.categoryId) {
    const category = await prisma.assetCategory.findFirst({
      where: { id: data.categoryId, organizationId: user.organizationId },
    });
    if (!category) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const asset = await prisma.asset.update({ where: { id }, data });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Updated asset ${asset.tag} (${asset.name})`,
    entity: "Asset",
  });

  return NextResponse.json({ asset });
}
