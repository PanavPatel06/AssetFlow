import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireCapability } from "@/lib/apiAuth";
import { validate, assetCreateSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

const LIST_INCLUDE = {
  category: { select: { id: true, name: true } },
  currentHolderUser: { select: { id: true, name: true } },
  currentHolderDepartment: { select: { id: true, name: true } },
};

// GET /api/assets — search/filter by tag, serial, name, location, category,
// or status (Screen 4's directory search).
export async function GET(req) {
  const { error } = await requireUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const categoryId = searchParams.get("categoryId");
  const status = searchParams.get("status");

  const assets = await prisma.asset.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { tag: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
              { serial: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: LIST_INCLUDE,
    orderBy: { tag: "asc" },
  });

  return NextResponse.json({ assets });
}

// Generates the next AF-#### tag and retries on a rare race-condition clash.
async function createAssetWithTag(data) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await prisma.asset.count();
    const tag = `AF-${String(count + 1 + attempt).padStart(4, "0")}`;
    try {
      return await prisma.asset.create({ data: { ...data, tag }, include: LIST_INCLUDE });
    } catch (e) {
      if (e.code === "P2002") continue; // tag taken concurrently — retry with next number
      throw e;
    }
  }
  throw new Error("Could not generate a unique asset tag after several attempts.");
}

// POST /api/assets — register a new asset. Enters the system as Available
// (Asset Manager / Admin only).
export async function POST(req) {
  const { user, error } = await requireCapability("registerAsset");
  if (error) return error;

  const { data, error: validationError } = validate(assetCreateSchema, await req.json());
  if (validationError) return validationError;

  const category = await prisma.assetCategory.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const asset = await createAssetWithTag({ ...data, status: "AVAILABLE" });

  await logActivity({
    actorId: user.id,
    action: `Registered asset ${asset.tag} (${asset.name})`,
    entity: "Asset",
  });

  return NextResponse.json({ asset }, { status: 201 });
}
