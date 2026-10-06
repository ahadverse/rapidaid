'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Route, XCircle } from 'lucide-react';
import { useState } from 'react';
import { listDriversAction } from '@/app/actions/drivers';
import { listAllTripsAction } from '@/app/actions/trips';
import { CancelTripDialog } from '@/components/admin/cancel-trip-dialog';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge, formatStatus } from '@/components/shared/status-badge';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePagination } from '@/hooks/use-pagination';
import { useUrlQuery } from '@/hooks/use-url-query';
import { useUrlSort } from '@/hooks/use-url-sort';
import { unwrap } from '@/lib/api/action-result';
import { TRIP_STATUSES, type Trip, type TripStatus } from '@/lib/api/types';
import { formatDateTime, formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const ALL = 'ALL';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CANCELLABLE: TripStatus[] = [
  'DISPATCHED',
  'EN_ROUTE_TO_PICKUP',
  'PATIENT_PICKED_UP',
  'EN_ROUTE_TO_HOSPITAL',
];

const isTripStatus = (value: string): value is TripStatus =>
  (TRIP_STATUSES as readonly string[]).includes(value);

// The picker yields a calendar day; the backend compares instants, so the day is pinned to Dhaka.
const startOfDay = (day: string) => `${day}T00:00:00+06:00`;
const endOfDay = (day: string) => `${day}T23:59:59.999+06:00`;

export function TripMonitor() {
  const { get, set } = useUrlQuery();
  const { page, limit, setPage } = usePagination();
  const { sortBy, sortOrder, setSort } = useUrlSort('dispatchedAt', 'desc');
  const [cancelling, setCancelling] = useState<Trip | null>(null);

  const rawStatus = get('status');
  const rawDriver = get('driverId');
  const rawFrom = get('from');
  const rawTo = get('to');
  const status = isTripStatus(rawStatus) ? rawStatus : undefined;
  const driverId = UUID.test(rawDriver) ? rawDriver : undefined;
  const from = DATE.test(rawFrom) ? rawFrom : undefined;
  const to = DATE.test(rawTo) ? rawTo : undefined;

  const params = {
    page,
    limit,
    status,
    driverId,
    from: from ? startOfDay(from) : undefined,
    to: to ? endOfDay(to) : undefined,
    sortBy,
    sortOrder,
  };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.trips.list(params),
    queryFn: async () => unwrap(await listAllTripsAction(params)),
    meta: { silent: true },
    placeholderData: (previous) => previous,
  });

  const drivers = useQuery({
    queryKey: queryKeys.drivers.list({ picker: true }),
    queryFn: async () => unwrap(await listDriversAction()).data,
    meta: { silent: true },
    staleTime: 5 * 60_000,
  });

  const columns: Column<Trip>[] = [
    {
      key: 'patient',
      header: 'Patient',
      cell: (row) => (
        <div className="max-w-60">
          <p className="font-medium">{row.request.patient.name}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{row.request.pickupAddress}</p>
        </div>
      ),
    },
    {
      key: 'crew',
      header: 'Crew',
      cell: (row) => (
        <div>
          <p>{row.driver.user.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.ambulance.regNumber}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      cell: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: 'dispatchedAt',
      header: 'Dispatched',
      sortKey: 'dispatchedAt',
      cell: (row) => formatDateTime(row.dispatchedAt),
    },
    { key: 'fare', header: 'Fare', cell: (row) => (row.fare ? formatMoney(row.fare) : '—') },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/trips/${row.id}`}>View</Link>
          </Button>
          {CANCELLABLE.includes(row.status) ? (
            <Button variant="ghost" size="sm" onClick={() => setCancelling(row)}>
              <XCircle aria-hidden="true" />
              Cancel
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  const filtered = Boolean(status || driverId || from || to);

  return (
    <div className="space-y-6">
      <PageHeader title="Trips" description="Every trip across the fleet, live and past." />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <Select
          value={status ?? ALL}
          onValueChange={(value) => set({ status: value === ALL ? undefined : value })}
        >
          <SelectTrigger className="w-full lg:w-52" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {TRIP_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {formatStatus(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={driverId ?? ALL}
          onValueChange={(value) => set({ driverId: value === ALL ? undefined : value })}
        >
          <SelectTrigger className="w-full lg:w-56" aria-label="Filter by driver">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All drivers</SelectItem>
            {drivers.data?.map((driver) => (
              <SelectItem key={driver.id} value={driver.id}>
                {driver.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          From
          <Input
            type="date"
            value={from ?? ''}
            max={to}
            onChange={(event) => set({ from: event.target.value })}
            className="w-full lg:w-40"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          To
          <Input
            type="date"
            value={to ?? ''}
            min={from}
            onChange={(event) => set({ to: event.target.value })}
            className="w-full lg:w-40"
          />
        </label>
      </div>
      {isPending ? (
        <TableSkeleton columns={6} rows={6} />
      ) : isError ? (
        <ErrorState title="Could not load trips" onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data.data}
            getRowId={(row) => row.id}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={setSort}
            emptyState={
              <EmptyState
                icon={Route}
                title="No trips found"
                message={
                  filtered
                    ? 'No trips match these filters. Try widening them.'
                    : 'Trips appear here as soon as a request is dispatched.'
                }
              />
            }
          />
          {data.meta && data.meta.totalPage > 1 ? (
            <Pagination meta={data.meta} onPageChange={setPage} />
          ) : null}
        </>
      )}
      <CancelTripDialog trip={cancelling} onClose={() => setCancelling(null)} />
    </div>
  );
}
