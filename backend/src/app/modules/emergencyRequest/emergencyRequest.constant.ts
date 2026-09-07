import { RequestStatus } from '@prisma/client';

export const emergencyRequestSortableFields = ['priority', 'status', 'createdAt'] as const;

export const emergencyRequestFilterableFields = ['searchTerm', 'status', 'priority'] as const;

export const OPEN_REQUEST_STATUSES: RequestStatus[] = [
  RequestStatus.PENDING,
  RequestStatus.DISPATCHED,
  RequestStatus.NO_AMBULANCE_AVAILABLE,
];

export const DISPATCHABLE_REQUEST_STATUSES: RequestStatus[] = [
  RequestStatus.PENDING,
  RequestStatus.NO_AMBULANCE_AVAILABLE,
];

export const emergencyRequestSelect = {
  id: true,
  pickupAddress: true,
  pickupLat: true,
  pickupLng: true,
  patientCondition: true,
  priority: true,
  status: true,
  requestedAmbulanceType: true,
  cancelReason: true,
  createdAt: true,
  updatedAt: true,
  patient: { select: { id: true, name: true, email: true, phone: true } },
} as const;
