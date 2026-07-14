import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import { validate, maintenanceCreateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

const INCLUDE = {
  asset: { select: { id: true, tag: true, name: true } },
  raisedBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
};

// GET /api/maintenance?assetId=...&status=...
export async function GET(req) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("assetId");
  const status = searchParams.get("status");

  const requests = await prisma.maintenanceRequest.findMany({
    where: { organizationId: user.organizationId, ...(assetId ? { assetId } : {}), ...(status ? { status } : {}) },
    include: INCLUDE,
    orderBy: { raisedOn: "desc" },
  });
  return NextResponse.json({ requests });
}

// POST /api/maintenance — raise a request. Any authenticated user (whoever
// holds/uses the asset) can raise one; it must be approved before repair work
// starts.
export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { data, error: validationError } = validate(maintenanceCreateSchema, await req.json());
  if (validationError) return validationError;

  const asset = await prisma.asset.findFirst({ where: { id: data.assetId, organizationId: user.organizationId } });
  if (!asset) {
    return NextResponse.json({ error: "Asset not found." }, { status: 404 });
  }

  const request = await prisma.maintenanceRequest.create({
    data: {
      organizationId: user.organizationId,
      assetId: data.assetId,
      raisedById: user.id,
      issue: data.issue,
      priority: data.priority ?? "MEDIUM",
      photoUrl: data.photoUrl,
    },
    include: INCLUDE,
  });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Raised maintenance request for ${asset.tag} (${asset.name})`,
    entity: "Maintenance",
  });

  return NextResponse.json({ request }, { status: 201 });
}
