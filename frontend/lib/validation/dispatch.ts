import { z } from 'zod';

export const AUTO_ASSIGN = 'AUTO';

export const dispatchSchema = z.object({
  ambulanceId: z.union([z.literal(AUTO_ASSIGN), z.uuid('Pick an ambulance from the list')]),
});

export type DispatchValues = z.infer<typeof dispatchSchema>;
