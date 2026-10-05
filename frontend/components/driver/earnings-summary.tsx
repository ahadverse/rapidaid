'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Banknote, Route, TrendingUp } from 'lucide-react';
import { listMyTripsAction } from '@/app/actions/trips';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { StatCard } from '@/components/shared/stat-card';
import { StatSkeleton } from '@/components/shared/stat-skeleton';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { unwrap } from '@/lib/api/action-result';
import type { Trip } from '@/lib/api/types';
import { formatDateTime, formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const SCAN_LIMIT = 100;

const columns: Column<Trip>[] = [
  {
    key: 'completedAt',
    header: 'Completed',
    cell: (trip) => (trip.completedAt ? formatDateTime(trip.completedAt) : '-'),
  },
  {
    key: 'trip',
    header: 'Trip',
    cell: (trip) => (
      <Link href={`/trips/${trip.id}`} className="text-primary hover:underline">
        {trip.request.pickupAddress}
      </Link>
    ),
  },
  { key: 'distance', header: 'Distance', cell: (trip) => `${Number(trip.distanceKm ?? 0)} km` },
  { key: 'fare', header: 'Fare', cell: (trip) => formatMoney(trip.fare ?? 0) },
];

export function EarningsSummary() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.trips.mine({ status: 'COMPLETED', earnings: true }),
    queryFn: async () =>
      unwrap(await listMyTripsAction({ status: 'COMPLETED', limit: SCAN_LIMIT })),
    meta: { silent: true },
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
        <TableSkeleton columns={4} rows={5} />
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Could not load your earnings" onRetry={() => void refetch()} />;
  }

  const trips = data.data;
  const total = trips.reduce((sum, trip) => sum + Number(trip.fare ?? 0), 0);
  const average = trips.length > 0 ? total / trips.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total fares" value={formatMoney(total)} icon={Banknote} />
        <StatCard label="Completed trips" value={trips.length} icon={Route} />
        <StatCard label="Average fare" value={formatMoney(average)} icon={TrendingUp} />
      </div>
      <DataTable
        columns={columns}
        rows={trips}
        getRowId={(trip) => trip.id}
        emptyState={
          <EmptyState
            icon={Banknote}
            title="No completed trips yet"
            message="Fares from trips you complete are totalled here."
          />
        }
      />
    </div>
  );
}
