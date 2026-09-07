import { TripStatus } from '@prisma/client';

export const ACTIVE_TRIP_STATUSES: TripStatus[] = [
  TripStatus.DISPATCHED,
  TripStatus.EN_ROUTE_TO_PICKUP,
  TripStatus.PATIENT_PICKED_UP,
  TripStatus.EN_ROUTE_TO_HOSPITAL,
  TripStatus.ARRIVED_AT_HOSPITAL,
];

export const TRIP_STATUS_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  [TripStatus.DISPATCHED]: [TripStatus.EN_ROUTE_TO_PICKUP, TripStatus.CANCELLED],
  [TripStatus.EN_ROUTE_TO_PICKUP]: [TripStatus.PATIENT_PICKED_UP, TripStatus.CANCELLED],
  [TripStatus.PATIENT_PICKED_UP]: [TripStatus.EN_ROUTE_TO_HOSPITAL, TripStatus.CANCELLED],
  [TripStatus.EN_ROUTE_TO_HOSPITAL]: [TripStatus.ARRIVED_AT_HOSPITAL, TripStatus.CANCELLED],
  [TripStatus.ARRIVED_AT_HOSPITAL]: [TripStatus.COMPLETED],
  [TripStatus.COMPLETED]: [],
  [TripStatus.CANCELLED]: [],
};

export const STATUS_ENDPOINT_BLOCKED: TripStatus[] = [TripStatus.COMPLETED];

export const COMPLETABLE_TRIP_STATUSES: TripStatus[] = [TripStatus.ARRIVED_AT_HOSPITAL];

export const MAX_TRIP_DISTANCE_KM = 500;

export const HOSPITAL_SELECTABLE_STATUSES: TripStatus[] = [
  TripStatus.DISPATCHED,
  TripStatus.EN_ROUTE_TO_PICKUP,
  TripStatus.PATIENT_PICKED_UP,
  TripStatus.EN_ROUTE_TO_HOSPITAL,
];

export const tripSortableFields = ['status', 'dispatchedAt', 'completedAt', 'createdAt'] as const;

export const tripFilterableFields = ['status', 'driverId', 'from', 'to'] as const;

export const tripDetailSelect = {
  id: true,
  status: true,
  distanceKm: true,
  fare: true,
  cancelReason: true,
  dispatchedAt: true,
  pickedUpAt: true,
  arrivedAt: true,
  completedAt: true,
  createdAt: true,
  ambulance: { select: { id: true, regNumber: true, type: true, status: true, stationArea: true } },
  driver: {
    select: {
      id: true,
      licenseNumber: true,
      user: { select: { id: true, name: true, phone: true } },
    },
  },
  hospital: { select: { id: true, name: true, area: true, phone: true } },
  request: {
    select: {
      id: true,
      pickupAddress: true,
      patientCondition: true,
      priority: true,
      status: true,
      patient: { select: { id: true, name: true, phone: true } },
    },
  },
} as const;

export const tripPaymentSelect = {
  id: true,
  amount: true,
  status: true,
  transactionId: true,
  createdAt: true,
} as const;
