import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

export async function GET(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const allocation = await prisma.allocation.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      asset: { select: { id: true, tag: true, name: true } },
      holderUser: { select: { id: true, name: true } },
      holderDepartment: { select: { id: true, name: true } },
      allocatedBy: { select: { id: true, name: true } },
    },
  });
  if (!allocation) {
    return NextResponse.json({ error: "Allocation not found." }, { status: 404 });
  }
  return NextResponse.json({ allocation });
}
