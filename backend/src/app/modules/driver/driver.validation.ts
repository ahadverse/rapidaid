import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from '../auth/auth.constant';
import { BD_PHONE_REGEX } from '../user/user.constant';

const create = z.object({
  body: z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters'),
    email: z.string().trim().toLowerCase().pipe(z.email('A valid email is required')),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    phone: z.string().trim().regex(BD_PHONE_REGEX, 'Phone must be a valid Bangladeshi number'),
    licenseNumber: z.string().trim().toUpperCase().min(4, 'License number is required'),
    nid: z.string().trim().min(10, 'NID must be at least 10 digits'),
    ambulanceId: z.uuid('A valid ambulance id is required').optional(),
  }),
});

const list = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    searchTerm: z.string().optional(),
    isAvailable: z.enum(['true', 'false']).optional(),
  }),
});

const updateAvailability = z.object({
  body: z.object({
    isAvailable: z.boolean('isAvailable must be true or false'),
  }),
});

export const DriverValidation = { create, list, updateAvailability };
