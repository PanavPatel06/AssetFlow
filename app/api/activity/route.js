import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

// GET /api/activity — the full audit log of who did what, when. Read-only,
// visible to every authenticated role (per the brief: "keep every role
// informed"), capped at the most recent 200 entries.
export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const log = await prisma.activityLog.findMany({
    include: { actor: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ log });
}
