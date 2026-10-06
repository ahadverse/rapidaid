import { z } from 'zod';
import { AMBULANCE_TYPES } from '@/lib/api/types';

const fare = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => value !== '' && Number(value) > 0, `${label} must be greater than zero`)
    .refine((value) => Number(value) <= 99999999, `${label} is out of range`);

export const ambulanceFormSchema = z.object({
  regNumber: z.string().trim().min(4, 'Registration number must be at least 4 characters'),
  type: z.enum(AMBULANCE_TYPES),
  baseFare: fare('Base fare'),
  perKmRate: fare('Per km rate'),
  stationArea: z.string().trim().min(2, 'Station area is required'),
});

export type AmbulanceFormValues = z.infer<typeof ambulanceFormSchema>;
