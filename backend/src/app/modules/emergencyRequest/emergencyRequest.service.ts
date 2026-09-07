import {
  AmbulanceStatus,
  AmbulanceType,
  Prisma,
  RequestStatus,
  Role,
  TripStatus,
  UserStatus,
} from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../lib/prisma';
import { buildMeta, calculatePagination, TPaginationOptions } from '../../utils/paginationHelper';
import { TJwtPayload } from '../../utils/jwt';
import { ACTIVE_TRIP_STATUSES, tripDetailSelect } from '../trip/trip.constant';
import {
  DISPATCHABLE_REQUEST_STATUSES,
  emergencyRequestSelect,
  emergencyRequestSortableFields,
  OPEN_REQUEST_STATUSES,
} from './emergencyRequest.constant';
import {
  TCreateEmergencyRequestPayload,
  TDispatchPayload,
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

const assertCanAccess = (user: TJwtPayload, patientId: string) => {
  if (user.role !== Role.ADMIN && user.userId !== patientId) {
    throw new AppError(403, 'You do not have permission to perform this action');
  }
};

const create = async (patientId: string, payload: TCreateEmergencyRequestPayload) => {
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

type TCrew = {
  driverId: string;
  ambulanceId: string;
  ambulanceType: AmbulanceType;
};

const findCrewCandidates = async (override: TDispatchPayload): Promise<TCrew[]> => {
  const candidates = await prisma.driverProfile.findMany({
    where: {
      isAvailable: true,
      user: { isDeleted: false, status: UserStatus.ACTIVE },
      ambulance: {
        status: AmbulanceStatus.AVAILABLE,
        isDeleted: false,
        trips: { none: { status: { in: ACTIVE_TRIP_STATUSES } } },
      },
      trips: { none: { status: { in: ACTIVE_TRIP_STATUSES } } },
      ...(override.driverId ? { id: override.driverId } : {}),
      ...(override.ambulanceId ? { ambulanceId: override.ambulanceId } : {}),
    },
    select: { id: true, ambulance: { select: { id: true, type: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return candidates.flatMap((candidate) =>
    candidate.ambulance
      ? [
          {
            driverId: candidate.id,
            ambulanceId: candidate.ambulance.id,
            ambulanceType: candidate.ambulance.type,
          },
        ]
      : [],
  );
};

const pickCrew = (candidates: TCrew[], requestedType: AmbulanceType | null) =>
  (requestedType && candidates.find((crew) => crew.ambulanceType === requestedType)) ??
  candidates[0] ??
  null;

const dispatch = async (adminId: string, id: string, payload: TDispatchPayload) => {
  const request = await prisma.emergencyRequest.findUnique({
    where: { id },
    select: { id: true, status: true, requestedAmbulanceType: true },
  });

  if (!request) {
    throw new AppError(404, 'Emergency request not found');
  }

  if (!DISPATCHABLE_REQUEST_STATUSES.includes(request.status)) {
    throw new AppError(409, `A ${request.status} emergency request cannot be dispatched`);
  }

  if (payload.ambulanceId) {
    const ambulance = await prisma.ambulance.findFirst({
      where: { id: payload.ambulanceId, isDeleted: false },
      select: { id: true },
    });

    if (!ambulance) {
      throw new AppError(404, 'Ambulance not found');
    }
  }

  if (payload.driverId) {
    const driver = await prisma.driverProfile.findUnique({
      where: { id: payload.driverId },
      select: { id: true },
    });

    if (!driver) {
      throw new AppError(404, 'Driver not found');
    }
  }

  const crew = pickCrew(await findCrewCandidates(payload), request.requestedAmbulanceType);

  if (!crew) {
    if (request.status !== RequestStatus.NO_AMBULANCE_AVAILABLE) {
      await prisma.emergencyRequest.update({
        where: { id },
        data: { status: RequestStatus.NO_AMBULANCE_AVAILABLE },
      });
    }

    throw new AppError(409, 'No ambulance with an available driver could be assigned right now');
  }

  return prisma.$transaction(async (tx) => {
    const claimedRequest = await tx.emergencyRequest.updateMany({
      where: { id, status: { in: DISPATCHABLE_REQUEST_STATUSES } },
      data: { status: RequestStatus.DISPATCHED },
    });

    if (claimedRequest.count === 0) {
      throw new AppError(409, 'This emergency request was just dispatched by someone else');
    }

    const claimedAmbulance = await tx.ambulance.updateMany({
      where: { id: crew.ambulanceId, status: AmbulanceStatus.AVAILABLE, isDeleted: false },
      data: { status: AmbulanceStatus.ON_TRIP },
    });

    if (claimedAmbulance.count === 0) {
      throw new AppError(409, 'That ambulance was just assigned to another emergency');
    }

    const claimedDriver = await tx.driverProfile.updateMany({
      where: { id: crew.driverId, isAvailable: true },
      data: { isAvailable: false },
    });

    if (claimedDriver.count === 0) {
      throw new AppError(409, 'That driver was just assigned to another emergency');
    }

    const trip = await tx.trip.create({
      data: {
        requestId: id,
        ambulanceId: crew.ambulanceId,
        driverId: crew.driverId,
        status: TripStatus.DISPATCHED,
      },
      select: tripDetailSelect,
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: 'DISPATCH',
        entity: 'EmergencyRequest',
        entityId: id,
        before: { status: request.status },
        after: {
          status: RequestStatus.DISPATCHED,
          tripId: trip.id,
          ambulanceId: crew.ambulanceId,
          driverId: crew.driverId,
        },
      },
    });

    return trip;
  });
};

export const EmergencyRequestService = { create, getAll, getById, update, cancel, dispatch };
