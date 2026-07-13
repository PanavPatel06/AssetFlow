import { prisma } from "@/lib/prisma";

// Small helpers so route handlers can record "who did what, when" and push a
// notification in one line, instead of repeating prisma.create calls everywhere.

export function logActivity({ actorId, action, entity }) {
  return prisma.activityLog.create({ data: { actorId, action, entity } });
}

export function notify({ userId, type, message }) {
  return prisma.notification.create({ data: { userId, type, message } });
}

export function notifyMany(userIds, { type, message }) {
  const ids = [...new Set(userIds)].filter(Boolean);
  if (ids.length === 0) return Promise.resolve();
  return prisma.notification.createMany({
    data: ids.map((userId) => ({ userId, type, message })),
  });
}
