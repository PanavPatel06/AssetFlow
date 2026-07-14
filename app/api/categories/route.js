import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireCapability } from "@/lib/apiAuth";
import { validate, categoryCreateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const categories = await prisma.assetCategory.findMany({
    where: { organizationId: user.organizationId },
    include: { _count: { select: { assets: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({
    categories: categories.map((c) => ({ ...c, count: c._count.assets, _count: undefined })),
  });
}

// POST — create category (Admin only).
export async function POST(req) {
  const { user, error } = await requireCapability("orgSetup");
  if (error) return error;

  const { data, error: validationError } = validate(categoryCreateSchema, await req.json());
  if (validationError) return validationError;

  const category = await prisma.assetCategory.create({
    data: { organizationId: user.organizationId, name: data.name, customFields: data.customFields ?? [] },
  });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Created asset category ${category.name}`,
    entity: "AssetCategory",
  });

  return NextResponse.json({ category }, { status: 201 });
}
