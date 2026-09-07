import { Prisma } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../lib/prisma';
import { getCached, invalidateCache, setCached } from '../../lib/redis';
import { buildMeta, calculatePagination, TPaginationOptions } from '../../utils/paginationHelper';
import { ACTIVE_TRIP_STATUSES } from '../trip/trip.constant';
import {
  HOSPITAL_CACHE_PREFIX,
  HOSPITAL_CACHE_TTL_SECONDS,
  hospitalListSelect,
  hospitalSortableFields,
} from './hospital.constant';
import {
  TCreateHospitalPayload,
  THospitalFilters,
  TUpdateHospitalPayload,
} from './hospital.interface';

const findActiveOrFail = async (id: string) => {
  const hospital = await prisma.hospital.findFirst({
    where: { id, isDeleted: false },
    select: { id: true },
  });

  if (!hospital) {
    throw new AppError(404, 'Hospital not found');
  }

  return hospital;
};

const assertNoDuplicate = async (name: string, area: string, excludeId?: string) => {
  const clash = await prisma.hospital.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      area: { equals: area, mode: 'insensitive' },
      isDeleted: false,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (clash) {
    throw new AppError(409, 'A hospital with this name already exists in that area');
  }
};

const create = async (payload: TCreateHospitalPayload) => {
  await assertNoDuplicate(payload.name, payload.area);

  const hospital = await prisma.hospital.create({ data: payload, select: hospitalListSelect });
  await invalidateCache(HOSPITAL_CACHE_PREFIX);

  return hospital;
};

type THospitalListResult = {
  data: Prisma.HospitalGetPayload<{ select: typeof hospitalListSelect }>[];
  meta: ReturnType<typeof buildMeta>;
};

const getAll = async (filters: THospitalFilters, options: TPaginationOptions) => {
  // Hospitals change far less often than they are read during a dispatch.
  const cacheKey = `${HOSPITAL_CACHE_PREFIX}${JSON.stringify({ filters, options })}`;
  const cached = await getCached<THospitalListResult>(cacheKey);

  if (cached) {
    return cached;
  }

  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const orderByField = hospitalSortableFields.includes(
    sortBy as (typeof hospitalSortableFields)[number],
  )
    ? sortBy
    : 'createdAt';

  const where: Prisma.HospitalWhereInput = {
    isDeleted: false,
    ...(filters.area ? { area: { equals: filters.area, mode: 'insensitive' } } : {}),
    ...(filters.specialization
      ? { specializations: { has: filters.specialization.toUpperCase() } }
      : {}),
    ...(filters.searchTerm
      ? {
          OR: [
            { name: { contains: filters.searchTerm, mode: 'insensitive' } },
            { area: { contains: filters.searchTerm, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.hospital.findMany({
      where,
      select: hospitalListSelect,
      orderBy: { [orderByField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.hospital.count({ where }),
  ]);

  const result: THospitalListResult = { data, meta: buildMeta(page, limit, total) };

  await setCached(cacheKey, result, HOSPITAL_CACHE_TTL_SECONDS);

  return result;
};

const getById = async (id: string) => {
  const hospital = await prisma.hospital.findFirst({
    where: { id, isDeleted: false },
    select: hospitalListSelect,
  });

  if (!hospital) {
    throw new AppError(404, 'Hospital not found');
  }

  return hospital;
};

const update = async (id: string, payload: TUpdateHospitalPayload) => {
  await findActiveOrFail(id);

  if (payload.name || payload.area) {
    const current = await prisma.hospital.findUniqueOrThrow({
      where: { id },
      select: { name: true, area: true },
    });

    await assertNoDuplicate(payload.name ?? current.name, payload.area ?? current.area, id);
  }

  const hospital = await prisma.hospital.update({
    where: { id },
    data: payload,
    select: hospitalListSelect,
  });
  await invalidateCache(HOSPITAL_CACHE_PREFIX);

  return hospital;
};

const softDelete = async (id: string) => {
  await findActiveOrFail(id);

  const activeTrips = await prisma.trip.count({
    where: { hospitalId: id, status: { in: ACTIVE_TRIP_STATUSES } },
  });

  if (activeTrips > 0) {
    throw new AppError(409, 'Hospital has active trips heading to it');
  }

  const hospital = await prisma.hospital.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
    select: hospitalListSelect,
  });
  await invalidateCache(HOSPITAL_CACHE_PREFIX);

  return hospital;
};

export const HospitalService = { create, getAll, getById, update, softDelete };
