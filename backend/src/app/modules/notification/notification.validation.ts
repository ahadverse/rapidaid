import { NotificationType } from '@prisma/client';
import { z } from 'zod';

const list = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    type: z.enum(NotificationType).optional(),
    isRead: z.enum(['true', 'false']).optional(),
  }),
});

const idParam = z.object({
  params: z.object({ id: z.uuid('A valid notification id is required') }),
});

export const NotificationValidation = { list, idParam };
