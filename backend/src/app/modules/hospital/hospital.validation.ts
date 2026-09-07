import { z } from 'zod';
import { HOSPITAL_PHONE_REGEX } from './hospital.constant';

const specializations = z
  .array(z.string().trim().toUpperCase().min(2, 'Specialization is too short'))
  .min(1, 'At least one specialization is required');

const create = z.object({
  body: z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters'),
    address: z.string().trim().min(5, 'Address must be at least 5 characters'),
    area: z.string().trim().min(2, 'Area is required'),
    phone: z.string().trim().regex(HOSPITAL_PHONE_REGEX, 'Phone must be a valid contact number'),
    specializations,
    availableBeds: z.int().min(0, 'Available beds cannot be negative').optional(),
  }),
});

const update = z.object({
  params: z.object({ id: z.uuid('A valid hospital id is required') }),
  body: z
    .object({
      name: z.string().trim().min(3, 'Name must be at least 3 characters').optional(),
      address: z.string().trim().min(5, 'Address must be at least 5 characters').optional(),
      area: z.string().trim().min(2, 'Area is required').optional(),
      phone: z
        .string()
        .trim()
        .regex(HOSPITAL_PHONE_REGEX, 'Phone must be a valid contact number')
        .optional(),
      specializations: specializations.optional(),
      availableBeds: z.int().min(0, 'Available beds cannot be negative').optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

const idParam = z.object({
  params: z.object({ id: z.uuid('A valid hospital id is required') }),
});

const list = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    searchTerm: z.string().optional(),
    area: z.string().optional(),
    specialization: z.string().optional(),
  }),
});

export const HospitalValidation = { create, update, idParam, list };
