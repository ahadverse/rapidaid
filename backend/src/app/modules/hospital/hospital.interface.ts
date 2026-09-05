export type THospitalFilters = {
  searchTerm?: string;
  area?: string;
  specialization?: string;
};

export type TCreateHospitalPayload = {
  name: string;
  address: string;
  area: string;
  phone: string;
  specializations: string[];
  availableBeds?: number;
};

export type TUpdateHospitalPayload = Partial<TCreateHospitalPayload>;
