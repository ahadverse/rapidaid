import { PaymentStatus } from '@prisma/client';
import { z } from 'zod';

const init = z.object({
  params: z.object({ tripId: z.uuid('A valid trip id is required') }),
});

const idParam = z.object({
  params: z.object({ id: z.uuid('A valid payment id is required') }),
});

const list = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    status: z.enum(PaymentStatus).optional(),
    tripId: z.uuid('A valid trip id is required').optional(),
  }),
});

const callback = z.object({
  body: z.looseObject({
    tran_id: z.string().trim().min(1, 'tran_id is required'),
    val_id: z.string().trim().min(1).optional(),
  }),
});

export const PaymentValidation = { init, callback, idParam, list };
