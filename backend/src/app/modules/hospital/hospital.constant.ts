export const hospitalSortableFields = ['name', 'area', 'availableBeds', 'createdAt'] as const;

export const hospitalFilterableFields = ['searchTerm', 'area', 'specialization'] as const;

export const HOSPITAL_PHONE_REGEX = /^\+?[\d\s-]{6,20}$/;

export const hospitalListSelect = {
  id: true,
  name: true,
  address: true,
  area: true,
  phone: true,
  specializations: true,
  availableBeds: true,
  createdAt: true,
} as const;
