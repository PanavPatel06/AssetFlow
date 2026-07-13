import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireCapability } from "@/lib/apiAuth";
import { validate, departmentUpdateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

export async function GET(req, { params }) {
  const { error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const department = await prisma.department.findUnique({
    where: { id },
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

  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Department not found." }, { status: 404 });
  }

  const department = await prisma.department.update({ where: { id }, data });

  await logActivity({
    actorId: user.id,
    action: `Updated department ${department.name}`,
    entity: "Department",
  });

  return NextResponse.json({ department });
}
