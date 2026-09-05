import { Role, User, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../../../config';
import AppError from '../../errors/AppError';
import prisma from '../../lib/prisma';
import { createToken, verifyToken } from '../../utils/jwt';
import { publicUserSelect } from './auth.constant';
import { TAuthTokens, TLoginPayload, TRegisterPayload } from './auth.interface';

const register = async (payload: TRegisterPayload) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });

  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const password = await bcrypt.hash(payload.password, config.bcryptSaltRounds);

  // Public registration always creates a patient; drivers and admins are provisioned by an admin.
  return prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password,
      role: Role.PATIENT,
    },
    select: publicUserSelect,
  });
};

const issueTokens = (user: Pick<User, 'id' | 'email' | 'role'>): TAuthTokens => {
  const payload = { userId: user.id, email: user.email, role: user.role };

  return {
    accessToken: createToken(payload, config.jwt.accessSecret, config.jwt.accessExpiresIn),
    refreshToken: createToken(payload, config.jwt.refreshSecret, config.jwt.refreshExpiresIn),
  };
};

const login = async (payload: TLoginPayload) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  // One message for every credential failure so the endpoint cannot be used to discover emails.
  if (!user || user.isDeleted || !user.password) {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatched = await bcrypt.compare(payload.password, user.password);

  if (!passwordMatched) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(403, 'Your account has been blocked');
  }

  const tokens = issueTokens(user);

  return {
    ...tokens,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
  };
};

const refreshToken = async (token: string | undefined) => {
  if (!token) {
    throw new AppError(401, 'Refresh token is required');
  }

  const decoded = verifyToken(token, config.jwt.refreshSecret);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, role: true, status: true, isDeleted: true },
  });

  if (!user || user.isDeleted) {
    throw new AppError(401, 'This account no longer exists');
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(403, 'Your account has been blocked');
  }

  return issueTokens(user);
};

export const AuthService = { register, login, refreshToken };
