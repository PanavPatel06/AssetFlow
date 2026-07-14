import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireCapability } from "@/lib/apiAuth";
import { validate, departmentCreateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

// GET /api/departments — list departments for one organization. Deliberately
// allows an unauthenticated call via ?organizationSlug=... (the signup form's
// "join an existing organization" step needs this list before the visitor has
// an account); otherwise it falls back to the signed-in user's own org.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const organizationSlug = searchParams.get("organizationSlug");

  let organizationId;
  if (organizationSlug) {
    const organization = await prisma.organization.findUnique({ where: { slug: organizationSlug } });
    if (!organization) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 });
    }
    organizationId = organization.id;
  } else {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    organizationId = user.organizationId;
  }

  const departments = await prisma.department.findMany({
    where: { organizationId },
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

  if (data.headId) {
    const head = await prisma.user.findFirst({ where: { id: data.headId, organizationId: user.organizationId } });
    if (!head) return NextResponse.json({ error: "Invalid department head." }, { status: 400 });
  }
  if (data.parentId) {
    const parent = await prisma.department.findFirst({ where: { id: data.parentId, organizationId: user.organizationId } });
    if (!parent) return NextResponse.json({ error: "Invalid parent department." }, { status: 400 });
  }

  const department = await prisma.department.create({
    data: {
      organizationId: user.organizationId,
      name: data.name,
      headId: data.headId ?? null,
      parentId: data.parentId ?? null,
      status: data.status ?? "ACTIVE",
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Created department ${department.name}`,
    entity: "Department",
  });

  return NextResponse.json({ department }, { status: 201 });
}
