import { Role, UserStatus } from '@prisma/client';

export type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type TLoginPayload = {
  email: string;
  password: string;
};

export type TChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export type TAuthTokens = {
  accessToken: string;
  refreshToken: string;
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
