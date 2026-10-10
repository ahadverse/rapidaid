import { z } from 'zod';
import { MAX_TRIP_DISTANCE_KM } from '@/lib/trip-flow';

export const completeTripSchema = z.object({
  distanceKm: z
    .string()
    .trim()
    .refine((value) => value !== '' && Number.isFinite(Number(value)), 'Enter the distance in km')
    .refine((value) => Number(value) > 0, 'Distance must be greater than zero')
    .refine(
      (value) => Number(value) <= MAX_TRIP_DISTANCE_KM,
      `Distance cannot exceed ${MAX_TRIP_DISTANCE_KM} km`,
    ),
});

export const tripHospitalSchema = z.object({
  hospitalId: z.uuid('Choose a destination hospital'),
});

export type CompleteTripValues = z.infer<typeof completeTripSchema>;
export type TripHospitalValues = z.infer<typeof tripHospitalSchema>;
