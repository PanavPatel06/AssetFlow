import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import { validate, bookingCreateSchema } from "@/lib/validation";
import { logActivity, notify } from "@/lib/activity";

const INCLUDE = {
  asset: { select: { id: true, tag: true, name: true, isBookable: true } },
  bookedBy: { select: { id: true, name: true } },
};

// Overlap rule: two bookings on the same resource clash if one starts before
// the other ends AND ends after the other starts. A booking starting exactly
// when another ends is fine (adjacent, not overlapping).
async function findOverlap(tx, { assetId, start, end, excludeId }) {
  return tx.booking.findFirst({
    where: {
      assetId,
      status: { not: "CANCELLED" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      start: { lt: end },
      end: { gt: start },
    },
  });
}

// GET /api/bookings?assetId=...&status=...
export async function GET(req) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("assetId");
  const status = searchParams.get("status");

  const bookings = await prisma.booking.findMany({
    where: { organizationId: user.organizationId, ...(assetId ? { assetId } : {}), ...(status ? { status } : {}) },
    include: INCLUDE,
    orderBy: { start: "desc" },
  });
  return NextResponse.json({ bookings });
}

// POST /api/bookings — book a shared resource by time slot; overlapping
// requests for the same resource are rejected.
export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { data, error: validationError } = validate(bookingCreateSchema, await req.json());
  if (validationError) return validationError;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findFirst({ where: { id: data.assetId, organizationId: user.organizationId } });
      if (!asset) throw Object.assign(new Error("Asset not found."), { status: 404 });
      if (!asset.isBookable) {
        throw Object.assign(new Error("This asset isn't a shared/bookable resource."), { status: 400 });
      }

      const overlap = await findOverlap(tx, { assetId: data.assetId, start: data.start, end: data.end });
      if (overlap) {
        throw Object.assign(
          new Error("This time slot overlaps an existing booking for this resource."),
          { status: 409, conflict: overlap }
        );
      }

      return tx.booking.create({
        data: {
          organizationId: user.organizationId,
          assetId: data.assetId,
          bookedById: user.id,
          start: data.start,
          end: data.end,
          purpose: data.purpose,
        },
        include: INCLUDE,
      });
    });

    await logActivity({
      organizationId: user.organizationId,
      actorId: user.id,
      action: `Booked ${booking.asset.name} (${booking.asset.tag})`,
      entity: "Booking",
    });
    await notify({
      userId: user.id,
      type: "BOOKING",
      message: `Booking confirmed: ${booking.asset.name}.`,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    if (e.status === 409) {
      return NextResponse.json({ error: e.message, conflict: e.conflict }, { status: 409 });
    }
    if (e.status) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
