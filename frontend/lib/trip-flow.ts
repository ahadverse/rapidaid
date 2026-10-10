import type { TripStatus } from '@/lib/api/types';

export const NEXT_TRIP_STATUS: Partial<Record<TripStatus, TripStatus>> = {
  DISPATCHED: 'EN_ROUTE_TO_PICKUP',
  EN_ROUTE_TO_PICKUP: 'PATIENT_PICKED_UP',
  PATIENT_PICKED_UP: 'EN_ROUTE_TO_HOSPITAL',
  EN_ROUTE_TO_HOSPITAL: 'ARRIVED_AT_HOSPITAL',
};

export const NEXT_ACTION: Partial<Record<TripStatus, { label: string; description: string }>> = {
  EN_ROUTE_TO_PICKUP: {
    label: 'Start trip to pickup',
    description: 'Marks the ambulance as on its way to the pickup address.',
  },
  PATIENT_PICKED_UP: {
    label: 'Confirm patient pickup',
    description: 'Confirms the patient is on board the ambulance.',
  },
  EN_ROUTE_TO_HOSPITAL: {
    label: 'Start transport to hospital',
    description: 'Marks the ambulance as heading to the destination hospital.',
  },
  ARRIVED_AT_HOSPITAL: {
    label: 'Confirm hospital arrival',
    description: 'Confirms the patient has been handed over to the hospital.',
  },
};

export const TRIP_STAGES: { status: TripStatus; label: string }[] = [
  { status: 'DISPATCHED', label: 'Dispatched' },
  { status: 'EN_ROUTE_TO_PICKUP', label: 'To pickup' },
  { status: 'PATIENT_PICKED_UP', label: 'Picked up' },
  { status: 'EN_ROUTE_TO_HOSPITAL', label: 'To hospital' },
  { status: 'ARRIVED_AT_HOSPITAL', label: 'At hospital' },
];

export const HOSPITAL_SELECTABLE: TripStatus[] = [
  'DISPATCHED',
  'EN_ROUTE_TO_PICKUP',
  'PATIENT_PICKED_UP',
  'EN_ROUTE_TO_HOSPITAL',
];

export const FINAL_TRIP_STATUSES: TripStatus[] = ['COMPLETED', 'CANCELLED'];

export const MAX_TRIP_DISTANCE_KM = 500;
