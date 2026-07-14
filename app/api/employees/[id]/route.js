import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireCapability } from "@/lib/apiAuth";
import { validate, employeeUpdateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";
import { ROLE_LABELS } from "@/lib/roles";

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  title: true,
  status: true,
  departmentId: true,
};

export async function GET(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const employee = await prisma.user.findFirst({
    where: { id, organizationId: user.organizationId },
    select: SAFE_SELECT,
  });
  if (!employee) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }
  return NextResponse.json({ employee });
}

// PATCH — the ONLY place roles are assigned. Admin promotes an Employee to
// Department Head / Asset Manager here (or changes status/department).
export async function PATCH(req, { params }) {
  const { user, error } = await requireCapability("orgSetup");
  if (error) return error;

  const { id } = await params;
  const { data, error: validationError } = validate(employeeUpdateSchema, await req.json());
  if (validationError) return validationError;

  const existing = await prisma.user.findFirst({ where: { id, organizationId: user.organizationId } });
  if (!existing) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  if (data.departmentId) {
    const department = await prisma.department.findFirst({
      where: { id: data.departmentId, organizationId: user.organizationId },
    });
    if (!department) return NextResponse.json({ error: "Invalid department." }, { status: 400 });
  }

  const employee = await prisma.user.update({ where: { id }, data, select: SAFE_SELECT });

  if (data.role && data.role !== existing.role) {
    await logActivity({
      organizationId: user.organizationId,
      actorId: user.id,
      action: `Promoted ${employee.name} to ${ROLE_LABELS[data.role]}`,
      entity: "Employee",
    });
  } else {
    await logActivity({
      organizationId: user.organizationId,
      actorId: user.id,
      action: `Updated employee ${employee.name}`,
      entity: "Employee",
    });
  }

  return NextResponse.json({ employee });
}
