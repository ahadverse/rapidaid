import { z } from 'zod';
import { AMBULANCE_TYPES, PRIORITIES } from '@/lib/api/types';

const pickupAddress = z.string().trim().min(5, 'Pickup address must be at least 5 characters');
const patientCondition = z
  .string()
  .trim()
  .min(5, 'Describe the patient condition in at least 5 characters')
  .max(500, 'Patient condition is too long');
const priority = z.enum(PRIORITIES);
const requestedAmbulanceType = z.enum(AMBULANCE_TYPES).nullable();

export const pickupStepSchema = z.object({ pickupAddress });
export const conditionStepSchema = z.object({ patientCondition, priority });
export const ambulanceStepSchema = z.object({ requestedAmbulanceType });

export const createRequestSchema = pickupStepSchema
  .extend(conditionStepSchema.shape)
  .extend(ambulanceStepSchema.shape);

export const updateRequestSchema = createRequestSchema;

export const cancelRequestSchema = z.object({
  cancelReason: z
    .string()
    .trim()
    .min(5, 'Cancel reason must be at least 5 characters')
    .max(300, 'Cancel reason is too long'),
});

export type CreateRequestValues = z.infer<typeof createRequestSchema>;
export type UpdateRequestValues = CreateRequestValues;
export type CancelRequestValues = z.infer<typeof cancelRequestSchema>;
