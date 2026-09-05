export const driverSortableFields = ['licenseNumber', 'isAvailable', 'createdAt'] as const;

export const driverFilterableFields = ['searchTerm', 'isAvailable'] as const;

export const driverProfileSelect = {
  id: true,
  licenseNumber: true,
  nid: true,
  isAvailable: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true, phone: true, status: true } },
  ambulance: { select: { id: true, regNumber: true, type: true, status: true } },
} as const;
