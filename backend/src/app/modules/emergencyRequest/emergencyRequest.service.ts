import { Prisma, RequestStatus, Role } from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../lib/prisma';
import { buildMeta, calculatePagination, TPaginationOptions } from '../../utils/paginationHelper';
import { TJwtPayload } from '../../utils/jwt';
import {
  emergencyRequestSelect,
  emergencyRequestSortableFields,
  OPEN_REQUEST_STATUSES,
} from './emergencyRequest.constant';
import {
  TCreateEmergencyRequestPayload,
  TEmergencyRequestFilters,
  TUpdateEmergencyRequestPayload,
} from './emergencyRequest.interface';

const findOrFail = async (id: string) => {
  const request = await prisma.emergencyRequest.findUnique({
    where: { id },
    select: { id: true, patientId: true, status: true },
  });

  if (!request) {
    throw new AppError(404, 'Emergency request not found');
  }

  return request;
};

// Admins act on every request; a patient is confined to the ones they raised.
const assertCanAccess = (user: TJwtPayload, patientId: string) => {
  if (user.role !== Role.ADMIN && user.userId !== patientId) {
    throw new AppError(403, 'You do not have permission to perform this action');
  }
};

const create = async (patientId: string, payload: TCreateEmergencyRequestPayload) => {
  // One live emergency per caller — duplicates would tie up a second ambulance
  // that another patient needs.
  const open = await prisma.emergencyRequest.findFirst({
    where: { patientId, status: { in: OPEN_REQUEST_STATUSES } },
    select: { id: true },
  });

  if (open) {
    throw new AppError(409, 'You already have an emergency request in progress');
  }

  return prisma.emergencyRequest.create({
    data: { ...payload, patientId },
    select: emergencyRequestSelect,
  });
};

const getAll = async (
  user: TJwtPayload,
  filters: TEmergencyRequestFilters,
  options: TPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const orderByField = emergencyRequestSortableFields.includes(
    sortBy as (typeof emergencyRequestSortableFields)[number],
  )
    ? sortBy
    : 'createdAt';

  const where: Prisma.EmergencyRequestWhereInput = {
    ...(user.role === Role.ADMIN ? {} : { patientId: user.userId }),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.searchTerm
      ? {
          OR: [
            { pickupAddress: { contains: filters.searchTerm, mode: 'insensitive' } },
            { patientCondition: { contains: filters.searchTerm, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.emergencyRequest.findMany({
      where,
      select: emergencyRequestSelect,
      // Postgres sorts an enum by its declared order, so sortBy=priority with
      // sortOrder=asc lists CRITICAL first and LOW last.
      orderBy: { [orderByField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.emergencyRequest.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getById = async (user: TJwtPayload, id: string) => {
  const existing = await findOrFail(id);
  assertCanAccess(user, existing.patientId);

  return prisma.emergencyRequest.findUniqueOrThrow({
    where: { id },
    select: emergencyRequestSelect,
  });
};

const update = async (
  user: TJwtPayload,
  id: string,
  payload: TUpdateEmergencyRequestPayload,
) => {
  const existing = await findOrFail(id);
  assertCanAccess(user, existing.patientId);

  // Once dispatched the details are already with a driver on the road, so they
  // are only editable while the request is still waiting.
  if (existing.status !== RequestStatus.PENDING) {
    throw new AppError(409, 'Only a pending emergency request can be updated');
  }

  return prisma.emergencyRequest.update({
    where: { id },
    data: payload,
    select: emergencyRequestSelect,
  });
};

const cancel = async (user: TJwtPayload, id: string, cancelReason: string) => {
  const existing = await findOrFail(id);
  assertCanAccess(user, existing.patientId);

  if (existing.status !== RequestStatus.PENDING) {
    throw new AppError(409, 'Only a pending emergency request can be cancelled');
  }

  return prisma.emergencyRequest.update({
    where: { id },
    data: { status: RequestStatus.CANCELLED, cancelReason },
    select: emergencyRequestSelect,
  });
};

export const EmergencyRequestService = { create, getAll, getById, update, cancel };
