import { AmbulanceStatus, AmbulanceType } from '@prisma/client';
import { z } from 'zod';

const regNumber = z
  .string()
  .trim()
  .toUpperCase()
  .min(4, 'Registration number must be at least 4 characters');

const fare = (label: string) =>
  z
    .number()
    .positive(`${label} must be greater than zero`)
    .max(99999999, `${label} is out of range`);

const create = z.object({
  body: z.object({
    regNumber,
    type: z.enum(AmbulanceType, 'Type must be BASIC, AC, ICU or FREEZER'),
    status: z.enum(AmbulanceStatus).optional(),
    baseFare: fare('Base fare'),
    perKmRate: fare('Per km rate'),
    stationArea: z.string().trim().min(2, 'Station area is required'),
  }),
});

const update = z.object({
  params: z.object({ id: z.uuid('A valid ambulance id is required') }),
  body: z
    .object({
      regNumber: regNumber.optional(),
      type: z.enum(AmbulanceType).optional(),
      baseFare: fare('Base fare').optional(),
      perKmRate: fare('Per km rate').optional(),
      stationArea: z.string().trim().min(2, 'Station area is required').optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'Provide at least one field to update',
    }),
});

const updateStatus = z.object({
  params: z.object({ id: z.uuid('A valid ambulance id is required') }),
  body: z.object({
    status: z.enum(AmbulanceStatus, 'Status must be AVAILABLE, ON_TRIP or MAINTENANCE'),
  }),
});

const idParam = z.object({
  params: z.object({ id: z.uuid('A valid ambulance id is required') }),
});

const list = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    searchTerm: z.string().optional(),
    type: z.enum(AmbulanceType).optional(),
    status: z.enum(AmbulanceStatus).optional(),
    stationArea: z.string().optional(),
  }),
});

export const AmbulanceValidation = { create, update, updateStatus, idParam, list };
