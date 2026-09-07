import {
  AmbulanceStatus,
  PaymentStatus,
  Prisma,
  Priority,
  RequestStatus,
  Role,
  TripStatus,
  UserStatus,
} from '@prisma/client';
import prisma from '../../lib/prisma';
import { getCached, setCached } from '../../lib/redis';
import { buildMeta, calculatePagination, TPaginationOptions } from '../../utils/paginationHelper';
import { ACTIVE_TRIP_STATUSES } from '../trip/trip.constant';
import {
  auditLogSelect,
  auditLogSortableFields,
  DASHBOARD_CACHE_KEY,
  DASHBOARD_CACHE_TTL_SECONDS,
  REPORT_DEFAULT_RANGE_DAYS,
  TOP_HOSPITAL_LIMIT,
} from './admin.constant';
import { TAuditLogFilters, TDailyTripRow, TReportFilters } from './admin.interface';

// groupBy only returns rows that exist, so every enum key is seeded with zero first.
const countByKey = <TRow extends { _count: { _all: number } }, TKey extends string>(
  rows: TRow[],
  keys: TKey[],
  pick: (row: TRow) => TKey,
): Record<TKey, number> => {
  const base = Object.fromEntries(keys.map((key) => [key, 0])) as Record<TKey, number>;

  for (const row of rows) {
    base[pick(row)] = row._count._all;
  }

  return base;
};

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
};

const getDashboardStats = async () => {
  const cached = await getCached<Record<string, unknown>>(DASHBOARD_CACHE_KEY);

  if (cached) {
    return { ...cached, cached: true };
  }

  const [
    usersByRole,
    blockedUsers,
    ambulancesByStatus,
    hospitals,
    requestsByStatus,
    requestsByPriority,
    tripsByStatus,
    activeTrips,
    tripsToday,
    paidRevenue,
    duePayments,
    completedTrips,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ['role'],
      where: { isDeleted: false },
      _count: { _all: true },
    }),
    prisma.user.count({ where: { isDeleted: false, status: UserStatus.BLOCKED } }),
    prisma.ambulance.groupBy({
      by: ['status'],
      where: { isDeleted: false },
      _count: { _all: true },
    }),
    prisma.hospital.count({ where: { isDeleted: false } }),
    prisma.emergencyRequest.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.emergencyRequest.groupBy({ by: ['priority'], _count: { _all: true } }),
    prisma.trip.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.trip.count({ where: { status: { in: ACTIVE_TRIP_STATUSES } } }),
    prisma.trip.count({ where: { dispatchedAt: { gte: startOfToday() } } }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.PENDING },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.trip.aggregate({
      where: { status: TripStatus.COMPLETED },
      _avg: { fare: true, distanceKm: true },
    }),
  ]);

  const stats = {
    users: {
      total: usersByRole.reduce((sum, row) => sum + row._count._all, 0),
      blocked: blockedUsers,
      byRole: countByKey(usersByRole, Object.values(Role), (row) => row.role),
    },
    ambulances: {
      total: ambulancesByStatus.reduce((sum, row) => sum + row._count._all, 0),
      byStatus: countByKey(ambulancesByStatus, Object.values(AmbulanceStatus), (row) => row.status),
    },
    hospitals: { total: hospitals },
    emergencyRequests: {
      total: requestsByStatus.reduce((sum, row) => sum + row._count._all, 0),
      byStatus: countByKey(requestsByStatus, Object.values(RequestStatus), (row) => row.status),
      byPriority: countByKey(requestsByPriority, Object.values(Priority), (row) => row.priority),
    },
    trips: {
      total: tripsByStatus.reduce((sum, row) => sum + row._count._all, 0),
      active: activeTrips,
      dispatchedToday: tripsToday,
      byStatus: countByKey(tripsByStatus, Object.values(TripStatus), (row) => row.status),
      averageFare: completedTrips._avg.fare?.toFixed(2) ?? '0.00',
      averageDistanceKm: completedTrips._avg.distanceKm?.toFixed(2) ?? '0.00',
    },
    revenue: {
      collected: (paidRevenue._sum.amount ?? new Prisma.Decimal(0)).toFixed(2),
      paidPayments: paidRevenue._count._all,
      outstanding: (duePayments._sum.amount ?? new Prisma.Decimal(0)).toFixed(2),
      pendingPayments: duePayments._count._all,
    },
    generatedAt: new Date().toISOString(),
  };

  await setCached(DASHBOARD_CACHE_KEY, stats, DASHBOARD_CACHE_TTL_SECONDS);

  return { ...stats, cached: false };
};

const getAuditLogs = async (filters: TAuditLogFilters, options: TPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const orderByField = auditLogSortableFields.includes(
    sortBy as (typeof auditLogSortableFields)[number],
  )
    ? sortBy
    : 'createdAt';

  const where: Prisma.AuditLogWhereInput = {
    ...(filters.entity ? { entity: { equals: filters.entity, mode: 'insensitive' } } : {}),
    ...(filters.action ? { action: { equals: filters.action, mode: 'insensitive' } } : {}),
    ...(filters.actorId ? { actorId: filters.actorId } : {}),
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {}),
          },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      select: auditLogSelect,
      orderBy: { [orderByField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const resolveRange = (filters: TReportFilters) => {
  const to = filters.to ? new Date(filters.to) : new Date();
  const from = filters.from
    ? new Date(filters.from)
    : new Date(to.getTime() - REPORT_DEFAULT_RANGE_DAYS * 24 * 60 * 60 * 1000);

  return { from, to };
};

const getTripReport = async (filters: TReportFilters) => {
  const { from, to } = resolveRange(filters);
  const range = { gte: from, lte: to };

  const [byStatus, byPriority, completed, cancelled, revenue, topHospitalRows, daily] =
    await Promise.all([
      prisma.trip.groupBy({
        by: ['status'],
        where: { dispatchedAt: range },
        _count: { _all: true },
      }),
      prisma.emergencyRequest.groupBy({
        by: ['priority'],
        where: { createdAt: range },
        _count: { _all: true },
      }),
      prisma.trip.aggregate({
        where: { status: TripStatus.COMPLETED, completedAt: range },
        _count: { _all: true },
        _sum: { fare: true, distanceKm: true },
        _avg: { fare: true, distanceKm: true },
      }),
      prisma.trip.count({ where: { status: TripStatus.CANCELLED, dispatchedAt: range } }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID, paidAt: range },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.trip.groupBy({
        by: ['hospitalId'],
        where: { hospitalId: { not: null }, dispatchedAt: range },
        _count: { _all: true },
        orderBy: { _count: { hospitalId: 'desc' } },
        take: TOP_HOSPITAL_LIMIT,
      }),
      // Raw SQL keeps the day bucketing in Postgres instead of pulling every trip into node.
      prisma.$queryRaw<TDailyTripRow[]>`
        SELECT to_char(date_trunc('day', "completedAt"), 'YYYY-MM-DD') AS date,
               count(*)::int AS trips,
               coalesce(sum("fare"), 0)::float AS revenue
        FROM "trips"
        WHERE "status"::text = 'COMPLETED'
          AND "completedAt" BETWEEN ${from} AND ${to}
        GROUP BY 1
        ORDER BY 1
      `,
    ]);

  const hospitals = await prisma.hospital.findMany({
    where: {
      id: { in: topHospitalRows.flatMap((row) => (row.hospitalId ? [row.hospitalId] : [])) },
    },
    select: { id: true, name: true, area: true },
  });

  return {
    range: { from: from.toISOString(), to: to.toISOString() },
    trips: {
      byStatus: Object.fromEntries(byStatus.map((row) => [row.status, row._count._all])),
      completed: completed._count._all,
      cancelled,
      totalDistanceKm: completed._sum.distanceKm?.toFixed(2) ?? '0.00',
      averageDistanceKm: completed._avg.distanceKm?.toFixed(2) ?? '0.00',
      averageFare: completed._avg.fare?.toFixed(2) ?? '0.00',
    },
    emergencyRequests: {
      byPriority: Object.fromEntries(byPriority.map((row) => [row.priority, row._count._all])),
    },
    revenue: {
      billed: completed._sum.fare?.toFixed(2) ?? '0.00',
      collected: (revenue._sum.amount ?? new Prisma.Decimal(0)).toFixed(2),
      paidPayments: revenue._count._all,
    },
    topHospitals: topHospitalRows.flatMap((row) => {
      const hospital = hospitals.find((item) => item.id === row.hospitalId);

      return hospital ? [{ ...hospital, trips: row._count._all }] : [];
    }),
    daily,
  };
};

export const AdminService = { getDashboardStats, getAuditLogs, getTripReport };
