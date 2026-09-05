import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../../../config';
import AppError from '../../errors/AppError';
import prisma from '../../lib/prisma';
import { publicUserSelect } from './auth.constant';
import { TRegisterPayload } from './auth.interface';

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

export const AuthService = { register };
