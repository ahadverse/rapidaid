import { Role, UserStatus } from '@prisma/client';
import { z } from 'zod';
import { BD_PHONE_REGEX } from './user.constant';

const idParam = z.object({
  params: z.object({
    id: z.uuid('A valid user id is required'),
  }),
});

const updateProfile = z.object({
  body: z
    .object({
      name: z.string().trim().min(3, 'Name must be at least 3 characters').optional(),
      phone: z
        .string()
        .trim()
        .regex(BD_PHONE_REGEX, 'Phone must be a valid Bangladeshi number')
        .optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

const updateStatus = z.object({
  params: z.object({
    id: z.uuid('A valid user id is required'),
  }),
  body: z.object({
    status: z.enum(UserStatus, 'Status must be ACTIVE or BLOCKED'),
  }),
});

const listUsers = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    searchTerm: z.string().optional(),
    role: z.enum(Role).optional(),
    status: z.enum(UserStatus).optional(),
  }),
});

export const UserValidation = { idParam, updateProfile, updateStatus, listUsers };
