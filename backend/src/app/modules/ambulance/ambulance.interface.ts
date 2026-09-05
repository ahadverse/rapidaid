import { AmbulanceStatus, AmbulanceType } from '@prisma/client';

export type TAmbulanceFilters = {
  searchTerm?: string;
  type?: AmbulanceType;
  status?: AmbulanceStatus;
  stationArea?: string;
};

export type TCreateAmbulancePayload = {
  regNumber: string;
  type: AmbulanceType;
  status?: AmbulanceStatus;
  baseFare: number;
  perKmRate: number;
  stationArea: string;
};

export type TUpdateAmbulancePayload = Partial<Omit<TCreateAmbulancePayload, 'status'>>;
