import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import { logActivity, notify } from "@/lib/activity";

// POST /api/bookings/[id]/cancel
export async function POST(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const booking = await prisma.booking.findFirst({
    where: { id, organizationId: user.organizationId },
    include: { asset: { select: { id: true, tag: true, name: true } } },
  });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "This booking is already cancelled." }, { status: 400 });
  }

  const updated = await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });

  await logActivity({
    organizationId: user.organizationId,
    actorId: user.id,
    action: `Cancelled booking for ${booking.asset.name} (${booking.asset.tag})`,
    entity: "Booking",
  });
  if (booking.bookedById !== user.id) {
    await notify({
      userId: booking.bookedById,
      type: "BOOKING",
      message: `Your booking for ${booking.asset.name} was cancelled.`,
    });
  }

  return NextResponse.json({ booking: updated });
}
