import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validate, registerSchema } from "@/lib/validation";

// Signup always creates an Employee account — no role selection at signup.
// The Admin promotes people to Department Head / Asset Manager afterwards,
// from the Employee Directory (see PATCH /api/employees/[id]).
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

  const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
  if (!department || department.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid department." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
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
