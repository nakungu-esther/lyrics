import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function notifyUser(
  userId: string,
  title: string,
  body?: string,
  data?: Prisma.InputJsonValue,
): Promise<void> {
  await prisma.notification.create({
    data: { userId, title, body, data },
  });
}

export async function listNotifications(userId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(userId: string, id: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
