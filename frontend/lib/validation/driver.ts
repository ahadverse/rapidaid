import { z } from 'zod';
import { registerSchema } from './auth';

export const NO_AMBULANCE = 'NONE';

export const driverFormSchema = registerSchema.extend({
  licenseNumber: z.string().trim().min(4, 'License number is required'),
  nid: z.string().trim().min(10, 'NID must be at least 10 digits'),
  ambulanceId: z.string(),
});

export type DriverFormValues = z.infer<typeof driverFormSchema>;
