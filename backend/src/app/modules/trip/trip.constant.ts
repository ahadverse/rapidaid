import { TripStatus } from '@prisma/client';

// Trips that still occupy an ambulance, a driver and a destination hospital.
export const ACTIVE_TRIP_STATUSES: TripStatus[] = [
  TripStatus.DISPATCHED,
  TripStatus.EN_ROUTE_TO_PICKUP,
  TripStatus.PATIENT_PICKED_UP,
  TripStatus.EN_ROUTE_TO_HOSPITAL,
  TripStatus.ARRIVED_AT_HOSPITAL,
];

// The whole state machine in one place — anything not listed here is an illegal
// jump and is rejected with a 400.
export const TRIP_STATUS_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  [TripStatus.DISPATCHED]: [TripStatus.EN_ROUTE_TO_PICKUP, TripStatus.CANCELLED],
  [TripStatus.EN_ROUTE_TO_PICKUP]: [TripStatus.PATIENT_PICKED_UP, TripStatus.CANCELLED],
  [TripStatus.PATIENT_PICKED_UP]: [TripStatus.EN_ROUTE_TO_HOSPITAL, TripStatus.CANCELLED],
  [TripStatus.EN_ROUTE_TO_HOSPITAL]: [TripStatus.ARRIVED_AT_HOSPITAL, TripStatus.CANCELLED],
  [TripStatus.ARRIVED_AT_HOSPITAL]: [TripStatus.COMPLETED],
  [TripStatus.COMPLETED]: [],
  [TripStatus.CANCELLED]: [],
};

// Completion settles the fare, raises the payment and frees the ambulance, so it
// runs as its own transaction behind PATCH /trips/:id/complete.
export const STATUS_ENDPOINT_BLOCKED: TripStatus[] = [TripStatus.COMPLETED];

// A destination can be chosen or changed right up until the ambulance arrives.
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
