import { NotificationType } from '@prisma/client';

export type TNotificationFilters = {
  type?: NotificationType;
  isRead?: string;
};

export type TNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
};
