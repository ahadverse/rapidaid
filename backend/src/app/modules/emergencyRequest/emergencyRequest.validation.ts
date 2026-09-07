import { AmbulanceType, Priority, RequestStatus } from '@prisma/client';
import { z } from 'zod';

const pickupAddress = z.string().trim().min(5, 'Pickup address must be at least 5 characters');

const patientCondition = z
  .string()
  .trim()
  .min(5, 'Describe the patient condition in at least 5 characters')
  .max(500, 'Patient condition is too long');

const pickupLat = z.number().min(-90, 'Latitude is out of range').max(90, 'Latitude is out of range');

const pickupLng = z
  .number()
  .min(-180, 'Longitude is out of range')
  .max(180, 'Longitude is out of range');

const priority = z.enum(Priority, 'Priority must be CRITICAL, HIGH, MEDIUM or LOW');

const requestedAmbulanceType = z.enum(
  AmbulanceType,
  'Requested ambulance type must be BASIC, AC, ICU or FREEZER',
);

const bothCoordinatesOrNeither = (body: { pickupLat?: number; pickupLng?: number }) =>
  (body.pickupLat === undefined) === (body.pickupLng === undefined);

const coordinatesMessage = 'Provide both pickupLat and pickupLng, or neither';

const create = z.object({
  body: z
    .object({
      pickupAddress,
      pickupLat: pickupLat.optional(),
      pickupLng: pickupLng.optional(),
      patientCondition,
      priority: priority.optional(),
      requestedAmbulanceType: requestedAmbulanceType.optional(),
    })
    .refine(bothCoordinatesOrNeither, {
      message: coordinatesMessage,
      path: ['pickupLng'],
    }),
});

const update = z.object({
  params: z.object({ id: z.uuid('A valid emergency request id is required') }),
  body: z
    .object({
      pickupAddress: pickupAddress.optional(),
      pickupLat: pickupLat.optional(),
      pickupLng: pickupLng.optional(),
      patientCondition: patientCondition.optional(),
      priority: priority.optional(),
      requestedAmbulanceType: requestedAmbulanceType.optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: 'Provide at least one field to update',
    })
    .refine(bothCoordinatesOrNeither, {
      message: coordinatesMessage,
      path: ['pickupLng'],
    }),
});

const cancel = z.object({
  params: z.object({ id: z.uuid('A valid emergency request id is required') }),
  body: z.object({
    cancelReason: z
      .string()
      .trim()
      .min(5, 'Cancel reason must be at least 5 characters')
      .max(300, 'Cancel reason is too long'),
  }),
});

const dispatch = z.object({
  params: z.object({ id: z.uuid('A valid emergency request id is required') }),
  body: z
    .object({
      ambulanceId: z.uuid('A valid ambulance id is required').optional(),
      driverId: z.uuid('A valid driver id is required').optional(),
    })
    .optional()
    .default({}),
});

const idParam = z.object({
  params: z.object({ id: z.uuid('A valid emergency request id is required') }),
});

const list = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    searchTerm: z.string().optional(),
    status: z.enum(RequestStatus).optional(),
    priority: priority.optional(),
  }),
});

export const EmergencyRequestValidation = { create, update, cancel, dispatch, idParam, list };
