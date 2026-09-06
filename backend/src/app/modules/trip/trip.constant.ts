import { TripStatus } from '@prisma/client';

// Trips that still occupy an ambulance, a driver and a destination hospital.
export const ACTIVE_TRIP_STATUSES: TripStatus[] = [
  TripStatus.DISPATCHED,
  TripStatus.EN_ROUTE_TO_PICKUP,
  TripStatus.PATIENT_PICKED_UP,
  TripStatus.EN_ROUTE_TO_HOSPITAL,
  TripStatus.ARRIVED_AT_HOSPITAL,
];

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
