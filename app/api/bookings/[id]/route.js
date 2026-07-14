import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import { validate } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

const INCLUDE = {
  asset: { select: { id: true, tag: true, name: true } },
  bookedBy: { select: { id: true, name: true } },
};

export async function GET(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const booking = await prisma.booking.findFirst({ where: { id, organizationId: user.organizationId }, include: INCLUDE });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  return NextResponse.json({ booking });
}

const rescheduleSchema = z
  .object({ start: z.coerce.date(), end: z.coerce.date() })
  .refine((v) => v.end > v.start, { message: "End time must be after the start time.", path: ["end"] });

// PATCH /api/bookings/[id] — reschedule (move/resize). Same overlap rule as
// creating a new booking, just excluding this booking from the check.
export async function PATCH(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const { data, error: validationError } = validate(rescheduleSchema, await req.json());
  if (validationError) return validationError;

  const existing = await prisma.booking.findFirst({ where: { id, organizationId: user.organizationId } });
  if (!existing) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (existing.status === "CANCELLED") {
    return NextResponse.json({ error: "This booking is cancelled." }, { status: 400 });
  }

  const overlap = await prisma.booking.findFirst({
    where: {
      assetId: existing.assetId,
      status: { not: "CANCELLED" },
      id: { not: id },
      start: { lt: data.end },
      end: { gt: data.start },
    },
  });
  if (overlap) {
    return NextResponse.json(
      { error: "This time slot overlaps an existing booking for this resource.", conflict: overlap },
      { status: 409 }
    );
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: { start: data.start, end: data.end },
    include: INCLUDE,
  });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Rescheduled booking for ${booking.asset.name} (${booking.asset.tag})`,
    entity: "Booking",
  });

  return NextResponse.json({ booking });
}
