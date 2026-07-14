import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireCapability } from "@/lib/apiAuth";
import { validate, departmentUpdateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

export async function GET(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const department = await prisma.department.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      head: { select: { id: true, name: true } },
      parent: { select: { id: true, name: true } },
      children: { select: { id: true, name: true } },
      employees: { select: { id: true, name: true, role: true, status: true } },
    },
  });
  if (!department) {
    return NextResponse.json({ error: "Department not found." }, { status: 404 });
  }
  return NextResponse.json({ department });
}

// PATCH — edit / deactivate (Admin only).
export async function PATCH(req, { params }) {
  const { user, error } = await requireCapability("orgSetup");
  if (error) return error;

  const { id } = await params;
  const { data, error: validationError } = validate(departmentUpdateSchema, await req.json());
  if (validationError) return validationError;

  const existing = await prisma.department.findFirst({ where: { id, organizationId: user.organizationId } });
  if (!existing) {
    return NextResponse.json({ error: "Department not found." }, { status: 404 });
  }

  if (data.headId) {
    const head = await prisma.user.findFirst({ where: { id: data.headId, organizationId: user.organizationId } });
    if (!head) return NextResponse.json({ error: "Invalid department head." }, { status: 400 });
  }
  if (data.parentId) {
    const parent = await prisma.department.findFirst({ where: { id: data.parentId, organizationId: user.organizationId } });
    if (!parent) return NextResponse.json({ error: "Invalid parent department." }, { status: 400 });
  }

  const department = await prisma.department.update({ where: { id }, data });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Updated department ${department.name}`,
    entity: "Department",
  });

  return NextResponse.json({ department });
}
