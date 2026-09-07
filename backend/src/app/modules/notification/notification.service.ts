import { Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../lib/prisma';
import { buildMeta, calculatePagination, TPaginationOptions } from '../../utils/paginationHelper';
import { notificationSelect, notificationSortableFields } from './notification.constant';
import { TNotificationFilters, TNotificationInput } from './notification.interface';

// Takes the transaction client so a dispatch or payment writes its notifications
// in the same atomic step as the state change that caused them.
const notify = async (db: Prisma.TransactionClient, entries: TNotificationInput[]) => {
  if (entries.length === 0) {
    return;
  }

  await db.notification.createMany({ data: entries });
};

const getMine = async (
  userId: string,
  filters: TNotificationFilters,
  options: TPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const orderByField = notificationSortableFields.includes(
    sortBy as (typeof notificationSortableFields)[number],
  )
    ? sortBy
    : 'createdAt';

  const where: Prisma.NotificationWhereInput = {
    userId,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.isRead ? { isRead: filters.isRead === 'true' } : {}),
  };

  const [data, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: notificationSelect,
      orderBy: { [orderByField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { data, meta: { ...buildMeta(page, limit, total), unread } };
};

const markAsRead = async (userId: string, id: string) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!notification) {
    throw new AppError(404, 'Notification not found');
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
    select: notificationSelect,
  });
};

const markAllAsRead = async (userId: string) => {
  const { count } = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { updated: count };
};

export const NotificationService = { notify, getMine, markAsRead, markAllAsRead };
