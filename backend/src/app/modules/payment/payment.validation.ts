import { z } from 'zod';

const init = z.object({
  params: z.object({ tripId: z.uuid('A valid trip id is required') }),
});

export const PaymentValidation = { init };
