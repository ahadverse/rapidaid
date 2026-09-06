import { TripStatus } from '@prisma/client';
import { z } from 'zod';

const updateStatus = z.object({
  params: z.object({ id: z.uuid('A valid trip id is required') }),
  body: z
    .object({
      status: z.enum(TripStatus, 'Status must be a valid trip status'),
      cancelReason: z
        .string()
        .trim()
        .min(5, 'Cancel reason must be at least 5 characters')
        .max(300, 'Cancel reason is too long')
        .optional(),
    })
    // A cancelled trip is the one transition that has to explain itself.
    .refine((body) => body.status !== TripStatus.CANCELLED || Boolean(body.cancelReason), {
      message: 'A cancel reason is required when cancelling a trip',
      path: ['cancelReason'],
    }),
});

const selectHospital = z.object({
  params: z.object({ id: z.uuid('A valid trip id is required') }),
  body: z.object({
    hospitalId: z.uuid('A valid hospital id is required'),
  }),
});

// Accepts a plain date or a full timestamp, so ?from=2026-09-01 works as expected.
const dateBound = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), `${label} must be a valid date`);

const idParam = z.object({
  params: z.object({ id: z.uuid('A valid trip id is required') }),
});

const list = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    status: z.enum(TripStatus).optional(),
    driverId: z.uuid('A valid driver id is required').optional(),
    from: dateBound('from').optional(),
    to: dateBound('to').optional(),
  }),
});

export const TripValidation = { updateStatus, selectHospital, idParam, list };
