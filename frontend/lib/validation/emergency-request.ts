import { z } from 'zod';
import { AMBULANCE_TYPES, PRIORITIES } from '@/lib/api/types';

export const updateRequestSchema = z.object({
  pickupAddress: z.string().trim().min(5, 'Pickup address must be at least 5 characters'),
  patientCondition: z
    .string()
    .trim()
    .min(5, 'Describe the patient condition in at least 5 characters')
    .max(500, 'Patient condition is too long'),
  priority: z.enum(PRIORITIES),
  requestedAmbulanceType: z.enum(AMBULANCE_TYPES).nullable(),
});

export const cancelRequestSchema = z.object({
  cancelReason: z
    .string()
    .trim()
    .min(5, 'Cancel reason must be at least 5 characters')
    .max(300, 'Cancel reason is too long'),
});

export type UpdateRequestValues = z.infer<typeof updateRequestSchema>;
export type CancelRequestValues = z.infer<typeof cancelRequestSchema>;
