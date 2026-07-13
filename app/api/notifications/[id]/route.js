import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import { validate, notificationUpdateSchema } from "@/lib/validation";

// PATCH /api/notifications/[id] — mark read/unread. Only the owner may update.
export async function PATCH(req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const { data, error: validationError } = validate(notificationUpdateSchema, await req.json());
  if (validationError) return validationError;

  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  const notification = await prisma.notification.update({ where: { id }, data: { read: data.read } });
  return NextResponse.json({ notification });
}
