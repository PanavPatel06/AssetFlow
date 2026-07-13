import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

// GET /api/notifications — the current user's own notifications.
export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notifications });
}
