import { Prisma, UserStatus } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../lib/prisma';
import { buildMeta, calculatePagination, TPaginationOptions } from '../../utils/paginationHelper';
import { publicUserSelect, userSortableFields } from './user.constant';
import { TUpdateProfilePayload, TUserFilters } from './user.interface';

const getMe = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

const updateMe = async (userId: string, payload: TUpdateProfilePayload) =>
  prisma.user.update({
    where: { id: userId },
    data: payload,
    select: publicUserSelect,
  });

const getAllUsers = async (filters: TUserFilters, options: TPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const orderByField = userSortableFields.includes(sortBy as (typeof userSortableFields)[number])
    ? sortBy
    : 'createdAt';

  const where: Prisma.UserWhereInput = {
    isDeleted: false,
    ...(filters.role ? { role: filters.role } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.searchTerm
      ? {
          OR: [
            { name: { contains: filters.searchTerm, mode: 'insensitive' } },
            { email: { contains: filters.searchTerm, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy: { [orderByField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id, isDeleted: false },
    select: {
      ...publicUserSelect,
      driverProfile: {
        select: { id: true, licenseNumber: true, isAvailable: true, ambulanceId: true },
      },
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
};

const updateUserStatus = async (id: string, actorId: string, status: UserStatus) => {
  if (id === actorId) {
    throw new AppError(400, 'You cannot change your own status');
  }

  const user = await prisma.user.findFirst({ where: { id, isDeleted: false }, select: { id: true } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return prisma.user.update({ where: { id }, data: { status }, select: publicUserSelect });
};

const softDeleteUser = async (id: string, actorId: string) => {
  if (id === actorId) {
    throw new AppError(400, 'You cannot delete your own account');
  }

  const user = await prisma.user.findFirst({ where: { id, isDeleted: false }, select: { id: true } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return prisma.user.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
    select: publicUserSelect,
  });
};

export const UserService = {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  updateUserStatus,
  softDeleteUser,
};
