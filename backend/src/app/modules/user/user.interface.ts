import { Role, UserStatus } from '@prisma/client';

export type TUserFilters = {
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
};

export type TUpdateProfilePayload = {
  name?: string;
  phone?: string;
};
