import { z } from 'zod';

const init = z.object({
  params: z.object({ tripId: z.uuid('A valid trip id is required') }),
});

const callback = z.object({
  body: z.looseObject({
    tran_id: z.string().trim().min(1, 'tran_id is required'),
    val_id: z.string().trim().min(1).optional(),
  }),
});

export const PaymentValidation = { init, callback };
