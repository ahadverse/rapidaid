import { Role, UserStatus } from '@prisma/client';

export type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type TPublicUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
};
