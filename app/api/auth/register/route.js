import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validate, registerSchema } from "@/lib/validation";

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "org";
}

// Appends -2, -3, ... until the slug is free.
async function uniqueSlug(base) {
  let slug = base;
  for (let i = 2; await prisma.organization.findUnique({ where: { slug } }); i++) {
    slug = `${base}-${i}`;
  }
  return slug;
}

// Signup either creates a brand-new organization (submitter becomes its
// Admin) or joins an existing one by its shareable slug (submitter joins as
// an Employee — the Admin promotes people afterwards, from the Employee
// Directory; see PATCH /api/employees/[id]).
export async function POST(req) {
  const { data, error } = validate(registerSchema, await req.json());
  if (error) return error;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  if (data.mode === "create") {
    const slug = await uniqueSlug(slugify(data.organizationName));
    const user = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: data.organizationName, slug },
      });
      return tx.user.create({
        data: {
          organizationId: organization.id,
          name: data.name,
          email: data.email,
          passwordHash,
          role: "ADMIN",
        },
        select: { id: true, name: true, email: true, role: true },
      });
    });
    return NextResponse.json({ user }, { status: 201 });
  }

  // mode === "join"
  const organization = await prisma.organization.findUnique({ where: { slug: data.organizationSlug } });
  if (!organization) {
    return NextResponse.json({ error: "Organization not found. Check the organization code." }, { status: 404 });
  }

  const department = await prisma.department.findFirst({
    where: { id: data.departmentId, organizationId: organization.id },
  });
  if (!department || department.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid department." }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: data.name,
      email: data.email,
      passwordHash,
      role: "EMPLOYEE",
      departmentId: data.departmentId,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
