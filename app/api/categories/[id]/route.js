import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireCapability } from "@/lib/apiAuth";
import { validate, categoryUpdateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

export async function GET(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const category = await prisma.assetCategory.findFirst({ where: { id, organizationId: user.organizationId } });
  if (!category) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }
  return NextResponse.json({ category });
}

export async function PATCH(req, { params }) {
  const { user, error } = await requireCapability("orgSetup");
  if (error) return error;

  const { id } = await params;
  const { data, error: validationError } = validate(categoryUpdateSchema, await req.json());
  if (validationError) return validationError;

  const existing = await prisma.assetCategory.findFirst({ where: { id, organizationId: user.organizationId } });
  if (!existing) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  const category = await prisma.assetCategory.update({ where: { id }, data });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Updated asset category ${category.name}`,
    entity: "AssetCategory",
  });

  return NextResponse.json({ category });
}
