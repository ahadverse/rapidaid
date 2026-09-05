export const hospitalSortableFields = ['name', 'area', 'availableBeds', 'createdAt'] as const;

export const hospitalFilterableFields = ['searchTerm', 'area', 'specialization'] as const;

// Hospital landlines and mobiles both appear here, so this is looser than the
// mobile-only rule used for user accounts.
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
