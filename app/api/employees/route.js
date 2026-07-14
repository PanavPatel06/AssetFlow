import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

// GET /api/employees — the Employee Directory. Any authenticated user can
// list it (needed across the app for pickers: allocate-to, booked-by, audit
// auditors, etc.) — only PATCH (role/status/department changes) is Admin-only.
export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const employees = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      status: true,
      departmentId: true,
      department: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ employees });
}
