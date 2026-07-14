import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

export async function GET(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const cycle = await prisma.auditCycle.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      auditors: { select: { id: true, name: true } },
      items: {
        include: { asset: { select: { id: true, tag: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!cycle) {
    return NextResponse.json({ error: "Audit cycle not found." }, { status: 404 });
  }
  return NextResponse.json({ cycle });
}
