import { TripStatus } from '@prisma/client';

// Trips that still occupy an ambulance, a driver and a destination hospital.
export const ACTIVE_TRIP_STATUSES: TripStatus[] = [
  TripStatus.DISPATCHED,
  TripStatus.EN_ROUTE_TO_PICKUP,
  TripStatus.PATIENT_PICKED_UP,
  TripStatus.EN_ROUTE_TO_HOSPITAL,
  TripStatus.ARRIVED_AT_HOSPITAL,
];
