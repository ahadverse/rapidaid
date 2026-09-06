import {
  AmbulanceStatus,
  PaymentStatus,
  Prisma,
  RequestStatus,
  Role,
  TripStatus,
} from '@prisma/client';
import AppError from '../../errors/AppError';
import prisma from '../../lib/prisma';
import { TJwtPayload } from '../../utils/jwt';
import { buildMeta, calculatePagination, TPaginationOptions } from '../../utils/paginationHelper';
import generateTransactionId from '../../utils/transactionId';
import {
  COMPLETABLE_TRIP_STATUSES,
  HOSPITAL_SELECTABLE_STATUSES,
  STATUS_ENDPOINT_BLOCKED,
  tripDetailSelect,
  tripPaymentSelect,
  tripSortableFields,
  TRIP_STATUS_TRANSITIONS,
} from './trip.constant';
import { TCompleteTripPayload, TTripFilters, TUpdateTripStatusPayload } from './trip.interface';

const loadTripOrFail = async (id: string) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      hospitalId: true,
      ambulanceId: true,
      driverId: true,
      requestId: true,
      driver: { select: { userId: true } },
      request: { select: { patientId: true } },
    },
  });

  if (!trip) {
    throw new AppError(404, 'Trip not found');
  }

  return trip;
};

type TLoadedTrip = Awaited<ReturnType<typeof loadTripOrFail>>;

// Reading a trip is open to the two people on it plus any admin.
const assertCanView = (user: TJwtPayload, trip: TLoadedTrip) => {
  const isParticipant =
    user.userId === trip.driver.userId || user.userId === trip.request.patientId;

  if (user.role !== Role.ADMIN && !isParticipant) {
    throw new AppError(403, 'You do not have permission to perform this action');
  }
};

// Driving the trip forward is the assigned driver's job; an admin can step in.
const assertCanDrive = (user: TJwtPayload, trip: TLoadedTrip) => {
  if (user.role !== Role.ADMIN && user.userId !== trip.driver.userId) {
    throw new AppError(403, 'You are not the driver assigned to this trip');
  }
};

const buildOrderBy = (sortBy: string) =>
  tripSortableFields.includes(sortBy as (typeof tripSortableFields)[number])
    ? sortBy
    : 'dispatchedAt';

const getAll = async (filters: TTripFilters, options: TPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const where: Prisma.TripWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.driverId ? { driverId: filters.driverId } : {}),
    ...(filters.from || filters.to
      ? {
          dispatchedAt: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {}),
          },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      select: tripDetailSelect,
      orderBy: { [buildOrderBy(sortBy)]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.trip.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

// The same endpoint means "my assignments" to a driver and "my history" to a patient.
const getMyTrips = async (
  user: TJwtPayload,
  filters: TTripFilters,
  options: TPaginationOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);

  const where: Prisma.TripWhereInput = {
    ...(user.role === Role.DRIVER
      ? { driver: { userId: user.userId } }
      : { request: { patientId: user.userId } }),
    ...(filters.status ? { status: filters.status } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      select: tripDetailSelect,
      orderBy: { [buildOrderBy(sortBy)]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.trip.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getById = async (user: TJwtPayload, id: string) => {
  const trip = await loadTripOrFail(id);
  assertCanView(user, trip);

  return prisma.trip.findUniqueOrThrow({ where: { id }, select: tripDetailSelect });
};

// Cancelling has to hand the ambulance, the driver and the request back, or the
// vehicle stays locked to a trip nobody is driving.
const cancelTrip = async (trip: TLoadedTrip, cancelReason: string) =>
  prisma.$transaction(async (tx) => {
    const cancelled = await tx.trip.updateMany({
      where: { id: trip.id, status: trip.status },
      data: { status: TripStatus.CANCELLED, cancelReason },
    });

    if (cancelled.count === 0) {
      throw new AppError(409, 'This trip was just updated by someone else');
    }

    await tx.ambulance.update({
      where: { id: trip.ambulanceId },
      data: { status: AmbulanceStatus.AVAILABLE },
    });

    await tx.driverProfile.update({
      where: { id: trip.driverId },
      data: { isAvailable: true },
    });

    await tx.emergencyRequest.update({
      where: { id: trip.requestId },
      data: { status: RequestStatus.CANCELLED, cancelReason },
    });

    return tx.trip.findUniqueOrThrow({ where: { id: trip.id }, select: tripDetailSelect });
  });

const updateStatus = async (user: TJwtPayload, id: string, payload: TUpdateTripStatusPayload) => {
  const trip = await loadTripOrFail(id);
  assertCanDrive(user, trip);

  if (STATUS_ENDPOINT_BLOCKED.includes(payload.status)) {
    throw new AppError(400, 'Use PATCH /trips/:id/complete to finish a trip');
  }

  const allowed = TRIP_STATUS_TRANSITIONS[trip.status];

  if (!allowed.includes(payload.status)) {
    throw new AppError(
      400,
      allowed.length === 0
        ? `A ${trip.status} trip can no longer change status`
        : `A trip cannot go from ${trip.status} to ${payload.status}`,
    );
  }

  if (payload.status === TripStatus.CANCELLED) {
    return cancelTrip(trip, payload.cancelReason as string);
  }

  // You cannot drive to a hospital nobody has chosen yet.
  if (payload.status === TripStatus.EN_ROUTE_TO_HOSPITAL && !trip.hospitalId) {
    throw new AppError(400, 'Select a destination hospital before heading there');
  }

  const now = new Date();
  const stamps: Partial<Record<TripStatus, Prisma.TripUpdateInput>> = {
    [TripStatus.PATIENT_PICKED_UP]: { pickedUpAt: now },
    [TripStatus.ARRIVED_AT_HOSPITAL]: { arrivedAt: now },
  };

  // Guarding on the status we read keeps two concurrent updates from both applying.
  const moved = await prisma.trip.updateMany({
    where: { id, status: trip.status },
    data: { status: payload.status, ...(stamps[payload.status] ?? {}) },
  });

  if (moved.count === 0) {
    throw new AppError(409, 'This trip was just updated by someone else');
  }

  return prisma.trip.findUniqueOrThrow({ where: { id }, select: tripDetailSelect });
};

const selectHospital = async (user: TJwtPayload, id: string, hospitalId: string) => {
  const trip = await loadTripOrFail(id);
  assertCanDrive(user, trip);

  if (!HOSPITAL_SELECTABLE_STATUSES.includes(trip.status)) {
    throw new AppError(409, `A destination cannot be set on a ${trip.status} trip`);
  }

  const hospital = await prisma.hospital.findFirst({
    where: { id: hospitalId, isDeleted: false },
    select: { id: true },
  });

  if (!hospital) {
    throw new AppError(404, 'Hospital not found');
  }

  return prisma.trip.update({
    where: { id },
    data: { hospitalId },
    select: tripDetailSelect,
  });
};

// Money is kept in Decimal end to end — a float would drift a few poisha on every
// fare and never reconcile against what the gateway charged.
const calculateFare = (
  baseFare: Prisma.Decimal,
  perKmRate: Prisma.Decimal,
  distanceKm: Prisma.Decimal,
) => baseFare.plus(perKmRate.times(distanceKm)).toDecimalPlaces(2);

const complete = async (user: TJwtPayload, id: string, payload: TCompleteTripPayload) => {
  const trip = await loadTripOrFail(id);
  assertCanDrive(user, trip);

  if (!COMPLETABLE_TRIP_STATUSES.includes(trip.status)) {
    throw new AppError(
      409,
      trip.status === TripStatus.COMPLETED
        ? 'This trip has already been completed'
        : `A ${trip.status} trip cannot be completed — the ambulance must reach the hospital first`,
    );
  }

  // Rates are read off the ambulance that actually ran the trip, so re-pricing the
  // fleet later never rewrites a fare that has already been billed.
  const ambulance = await prisma.ambulance.findUniqueOrThrow({
    where: { id: trip.ambulanceId },
    select: { baseFare: true, perKmRate: true },
  });

  // The column stores 2 decimals, so round here too — otherwise the stored distance
  // and the distance the fare was built from would disagree.
  const distanceKm = new Prisma.Decimal(payload.distanceKm).toDecimalPlaces(2);
  const fare = calculateFare(ambulance.baseFare, ambulance.perKmRate, distanceKm);

  return prisma.$transaction(async (tx) => {
    // Guarded on the status we read: a second driver tapping complete finds zero
    // rows and rolls back rather than raising a second bill for the same trip.
    const completed = await tx.trip.updateMany({
      where: { id, status: trip.status },
      data: { status: TripStatus.COMPLETED, distanceKm, fare, completedAt: new Date() },
    });

    if (completed.count === 0) {
      throw new AppError(409, 'This trip was just updated by someone else');
    }

    // The crew and the vehicle go back into the dispatch pool together; leaving
    // either one claimed shrinks the fleet for every request that follows.
    await tx.ambulance.update({
      where: { id: trip.ambulanceId },
      data: { status: AmbulanceStatus.AVAILABLE },
    });

    await tx.driverProfile.update({
      where: { id: trip.driverId },
      data: { isAvailable: true },
    });

    await tx.emergencyRequest.update({
      where: { id: trip.requestId },
      data: { status: RequestStatus.COMPLETED },
    });

    // The bill is raised now rather than at checkout, so an unpaid trip is a row
    // an admin can chase instead of an intention nobody recorded.
    const payment = await tx.payment.create({
      data: {
        tripId: trip.id,
        patientId: trip.request.patientId,
        amount: fare,
        transactionId: generateTransactionId(),
        status: PaymentStatus.PENDING,
      },
      select: tripPaymentSelect,
    });

    await tx.auditLog.create({
      data: {
        actorId: user.userId,
        action: 'COMPLETE_TRIP',
        entity: 'Trip',
        entityId: trip.id,
        before: { status: trip.status },
        after: {
          status: TripStatus.COMPLETED,
          distanceKm: distanceKm.toFixed(2),
          fare: fare.toFixed(2),
          paymentId: payment.id,
        },
      },
    });

    const settled = await tx.trip.findUniqueOrThrow({ where: { id }, select: tripDetailSelect });

    return { ...settled, payment };
  });
};

export const TripService = {
  getAll,
  getMyTrips,
  getById,
  updateStatus,
  selectHospital,
  complete,
};
