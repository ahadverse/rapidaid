export const BD_PHONE_REGEX = /^(?:\+880|880|0)1[3-9]\d{8}$/;

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

export const userSortableFields = ['name', 'email', 'role', 'status', 'createdAt'] as const;

export const userFilterableFields = ['searchTerm', 'role', 'status'] as const;
