export type TDriverFilters = {
  searchTerm?: string;
  isAvailable?: string;
};

export type TCreateDriverPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  licenseNumber: string;
  nid: string;
  ambulanceId?: string;
};
