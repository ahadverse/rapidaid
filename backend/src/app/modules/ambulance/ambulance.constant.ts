export const ambulanceSortableFields = [
  'regNumber',
  'type',
  'status',
  'baseFare',
  'perKmRate',
  'stationArea',
  'createdAt',
] as const;

export const ambulanceFilterableFields = ['searchTerm', 'type', 'status', 'stationArea'] as const;

export const ambulanceListSelect = {
  id: true,
  regNumber: true,
  type: true,
  status: true,
  baseFare: true,
  perKmRate: true,
  stationArea: true,
  createdAt: true,
} as const;
