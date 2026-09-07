import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../../../config';
import AppError from '../../errors/AppError';
import prisma, { transactionOptions } from '../../lib/prisma';
import { buildMeta, calculatePagination, TPaginationOptions } from '../../utils/paginationHelper';
import { ACTIVE_TRIP_STATUSES } from '../trip/trip.constant';
import { driverProfileSelect, driverSortableFields } from './driver.constant';
import { TCreateDriverPayload, TDriverFilters } from './driver.interface';

const create = async (payload: TCreateDriverPayload) => {
  const { name, email, password, phone, licenseNumber, nid, ambulanceId } = payload;

  const clash = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { driverProfile: { licenseNumber } },
        { driverProfile: { nid } },
      ],
    },
    select: { email: true },
  });

  if (clash) {
    throw new AppError(409, 'A driver with this email, license number or NID already exists');
  }

  if (ambulanceId) {
    const ambulance = await prisma.ambulance.findFirst({
      where: { id: ambulanceId, isDeleted: false },
      select: { id: true },
    });

    if (!ambulance) {
      throw new AppError(404, 'Ambulance not found');
    }
  }

  const hashed = await bcrypt.hash(password, config.bcryptSaltRounds);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, phone, password: hashed, role: Role.DRIVER },
      select: { id: true },
    });

    return tx.driverProfile.create({
      data: { userId: user.id, licenseNumber, nid, ambulanceId: ambulanceId ?? null },
      select: driverProfileSelect,
    });
  }, transactionOptions);
};

const getAll = async (filters: TDriverFilters, options: TPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const orderByField = driverSortableFields.includes(
    sortBy as (typeof driverSortableFields)[number],
  )
    ? sortBy
    : 'createdAt';

  const where: Prisma.DriverProfileWhereInput = {
    user: { isDeleted: false },
    ...(filters.isAvailable ? { isAvailable: filters.isAvailable === 'true' } : {}),
    ...(filters.searchTerm
      ? {
          OR: [
            { licenseNumber: { contains: filters.searchTerm, mode: 'insensitive' } },
            { user: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
            { user: { email: { contains: filters.searchTerm, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.driverProfile.findMany({
      where,
      select: driverProfileSelect,
      orderBy: { [orderByField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.driverProfile.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getMyProfile = async (userId: string) => {
  const profile = await prisma.driverProfile.findUnique({
    where: { userId },
    select: driverProfileSelect,
  });

  if (!profile) {
    throw new AppError(404, 'Driver profile not found');
  }

  return profile;
};

const updateMyAvailability = async (userId: string, isAvailable: boolean) => {
  const profile = await prisma.driverProfile.findUnique({
    where: { userId },
    select: { id: true, ambulanceId: true },
  });

  if (!profile) {
    throw new AppError(404, 'Driver profile not found');
  }

  if (isAvailable && !profile.ambulanceId) {
    throw new AppError(400, 'You need an assigned ambulance before going available');
  }

  if (!isAvailable) {
    const activeTrips = await prisma.trip.count({
      where: { driverId: profile.id, status: { in: ACTIVE_TRIP_STATUSES } },
    });

    if (activeTrips > 0) {
      throw new AppError(409, 'You cannot go offline while a trip is in progress');
    }
  }

  return prisma.driverProfile.update({
    where: { userId },
    data: { isAvailable },
    select: driverProfileSelect,
  });
};

export const DriverService = { create, getAll, getMyProfile, updateMyAvailability };
