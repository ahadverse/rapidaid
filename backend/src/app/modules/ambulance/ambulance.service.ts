import { AmbulanceStatus, Prisma, Role } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../lib/prisma';
import { buildMeta, calculatePagination, TPaginationOptions } from '../../utils/paginationHelper';
import { TJwtPayload } from '../../utils/jwt';
import { ambulanceListSelect, ambulanceSortableFields } from './ambulance.constant';
import {
  TAmbulanceFilters,
  TCreateAmbulancePayload,
  TUpdateAmbulancePayload,
} from './ambulance.interface';

const findActiveOrFail = async (id: string) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { id, isDeleted: false },
    select: { id: true, status: true },
  });

  if (!ambulance) {
    throw new AppError(404, 'Ambulance not found');
  }

  return ambulance;
};

const create = async (payload: TCreateAmbulancePayload) => {
  const existing = await prisma.ambulance.findUnique({
    where: { regNumber: payload.regNumber },
    select: { id: true },
  });

  if (existing) {
    throw new AppError(409, 'An ambulance with this registration number already exists');
  }

  return prisma.ambulance.create({ data: payload, select: ambulanceListSelect });
};

const getAll = async (filters: TAmbulanceFilters, options: TPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const orderByField = ambulanceSortableFields.includes(
    sortBy as (typeof ambulanceSortableFields)[number],
  )
    ? sortBy
    : 'createdAt';

  const where: Prisma.AmbulanceWhereInput = {
    isDeleted: false,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.stationArea
      ? { stationArea: { equals: filters.stationArea, mode: 'insensitive' } }
      : {}),
    ...(filters.searchTerm
      ? { regNumber: { contains: filters.searchTerm, mode: 'insensitive' } }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.ambulance.findMany({
      where,
      select: ambulanceListSelect,
      orderBy: { [orderByField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.ambulance.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getById = async (id: string) => {
  const ambulance = await prisma.ambulance.findFirst({
    where: { id, isDeleted: false },
    select: {
      ...ambulanceListSelect,
      drivers: {
        select: { id: true, licenseNumber: true, isAvailable: true, user: { select: { name: true } } },
      },
    },
  });

  if (!ambulance) {
    throw new AppError(404, 'Ambulance not found');
  }

  return ambulance;
};

const update = async (id: string, payload: TUpdateAmbulancePayload) => {
  await findActiveOrFail(id);

  if (payload.regNumber) {
    const clash = await prisma.ambulance.findFirst({
      where: { regNumber: payload.regNumber, id: { not: id } },
      select: { id: true },
    });

    if (clash) {
      throw new AppError(409, 'An ambulance with this registration number already exists');
    }
  }

  return prisma.ambulance.update({ where: { id }, data: payload, select: ambulanceListSelect });
};

const updateStatus = async (id: string, status: AmbulanceStatus, actor: TJwtPayload) => {
  const ambulance = await findActiveOrFail(id);

  if (actor.role === Role.DRIVER) {
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: actor.userId },
      select: { ambulanceId: true },
    });

    if (profile?.ambulanceId !== id) {
      throw new AppError(403, 'You can only update the ambulance assigned to you');
    }
  }

  if (ambulance.status === AmbulanceStatus.ON_TRIP) {
    throw new AppError(409, 'Ambulance is on an active trip');
  }

  if (status === AmbulanceStatus.ON_TRIP) {
    throw new AppError(400, 'ON_TRIP is set by dispatch, not manually');
  }

  return prisma.ambulance.update({ where: { id }, data: { status }, select: ambulanceListSelect });
};

const softDelete = async (id: string) => {
  const ambulance = await findActiveOrFail(id);

  if (ambulance.status === AmbulanceStatus.ON_TRIP) {
    throw new AppError(409, 'Ambulance is on an active trip');
  }

  return prisma.ambulance.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
    select: ambulanceListSelect,
  });
};

export const AmbulanceService = { create, getAll, getById, update, updateStatus, softDelete };
