// BD mobile format: optional +880/880/0 prefix, operator digit 3-9, then 8 digits.
export const BD_PHONE_REGEX = /^(?:\+880|880|0)1[3-9]\d{8}$/;

export const PASSWORD_MIN_LENGTH = 8;

// Shared select so a password hash can never leave the service by accident.
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
} as const;
