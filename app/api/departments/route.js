import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/apiAuth";
import { validate, departmentCreateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

// GET /api/departments — list all. Deliberately public (no session check):
// department names aren't sensitive, and the signup form needs this list
// before the visitor has an account. Used for dropdowns across the app too
// (signup, asset registration).
export async function GET() {
  const departments = await prisma.department.findMany({
    include: { head: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ departments });
}

// POST /api/departments — create (Admin only).
export async function POST(req) {
  const { user, error } = await requireCapability("orgSetup");
  if (error) return error;

  const { data, error: validationError } = validate(departmentCreateSchema, await req.json());
  if (validationError) return validationError;

  const department = await prisma.department.create({
    data: {
      name: data.name,
      headId: data.headId ?? null,
      parentId: data.parentId ?? null,
      status: data.status ?? "ACTIVE",
    },
  });

  await logActivity({
    actorId: user.id,
    action: `Created department ${department.name}`,
    entity: "Department",
  });

  return NextResponse.json({ department }, { status: 201 });
}
