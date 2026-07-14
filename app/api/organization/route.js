import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

// GET /api/organization — the current user's own organization (name + the
// shareable "organization code" slug new teammates use to join at signup).
export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;

  const organization = await prisma.organization.findUnique({
    where: { id: user.organizationId },
    select: { id: true, name: true, slug: true },
  });
  return NextResponse.json({ organization });
}
