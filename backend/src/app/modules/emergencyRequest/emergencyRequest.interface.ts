import { AmbulanceType, Priority, RequestStatus } from '@prisma/client';

export type TEmergencyRequestFilters = {
  searchTerm?: string;
  status?: RequestStatus;
  priority?: Priority;
};

export type TCreateEmergencyRequestPayload = {
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  patientCondition: string;
  priority?: Priority;
  requestedAmbulanceType?: AmbulanceType;
};

export type TUpdateEmergencyRequestPayload = Partial<TCreateEmergencyRequestPayload>;
