import type { TripStatus } from '@/lib/api/types';

export const NEXT_TRIP_STATUS: Partial<Record<TripStatus, TripStatus>> = {
  DISPATCHED: 'EN_ROUTE_TO_PICKUP',
  EN_ROUTE_TO_PICKUP: 'PATIENT_PICKED_UP',
  PATIENT_PICKED_UP: 'EN_ROUTE_TO_HOSPITAL',
  EN_ROUTE_TO_HOSPITAL: 'ARRIVED_AT_HOSPITAL',
};

export const NEXT_ACTION_LABEL: Partial<Record<TripStatus, string>> = {
  EN_ROUTE_TO_PICKUP: 'Start heading to pickup',
  PATIENT_PICKED_UP: 'Patient picked up',
  EN_ROUTE_TO_HOSPITAL: 'Heading to hospital',
  ARRIVED_AT_HOSPITAL: 'Arrived at hospital',
};

export const HOSPITAL_SELECTABLE: TripStatus[] = [
  'DISPATCHED',
  'EN_ROUTE_TO_PICKUP',
  'PATIENT_PICKED_UP',
  'EN_ROUTE_TO_HOSPITAL',
];

export const FINAL_TRIP_STATUSES: TripStatus[] = ['COMPLETED', 'CANCELLED'];

export const MAX_TRIP_DISTANCE_KM = 500;
