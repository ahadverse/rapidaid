import { TripStatus } from '@prisma/client';

export type TTripFilters = {
  status?: TripStatus;
  driverId?: string;
  from?: string;
  to?: string;
};

export type TUpdateTripStatusPayload = {
  status: TripStatus;
  cancelReason?: string;
};

export type TSelectHospitalPayload = {
  hospitalId: string;
};

export type TCompleteTripPayload = {
  distanceKm: number;
};
