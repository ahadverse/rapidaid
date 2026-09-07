export const notificationSortableFields = ['createdAt', 'type'] as const;

export const notificationFilterableFields = ['type', 'isRead'] as const;

export const notificationSelect = {
  id: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  createdAt: true,
} as const;
