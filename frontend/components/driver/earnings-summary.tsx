'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Banknote, CircleCheck, Clock, Route } from 'lucide-react';
import { listMyTripsAction } from '@/app/actions/trips';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Pagination } from '@/components/shared/pagination';
import { StatCard } from '@/components/shared/stat-card';
import { StatSkeleton } from '@/components/shared/stat-skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePagination } from '@/hooks/use-pagination';
import { useUrlQuery } from '@/hooks/use-url-query';
import { unwrap } from '@/lib/api/action-result';
import type { Trip } from '@/lib/api/types';
import { formatDateTime, formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const SCAN_LIMIT = 100;
const ALL = 'ALL';

type PaymentState = 'PAID' | 'PENDING' | 'UNPAID';
type EarningRow = Trip & { payment: PaymentState };

const FILTERS = [
  { value: 'paid', label: 'Paid' },
  { value: 'awaiting', label: 'Awaiting payment' },
] as const;

const paymentOf = (trip: Trip): PaymentState => {
  const status = trip.payments?.[0]?.status;

  return status === 'PAID' || status === 'PENDING' ? status : 'UNPAID';
};

const sumFares = (rows: EarningRow[]) => rows.reduce((sum, row) => sum + Number(row.fare ?? 0), 0);

const columns: Column<EarningRow>[] = [
  {
    key: 'completedAt',
    header: 'Completed',
    cell: (row) => (row.completedAt ? formatDateTime(row.completedAt) : '—'),
  },
  {
    key: 'patient',
    header: 'Patient',
    cell: (row) => <span className="font-medium">{row.request.patient.name}</span>,
  },
  {
    key: 'route',
    header: 'Route',
    cell: (row) => (
      <div className="max-w-64">
        <p className="line-clamp-1">{row.request.pickupAddress}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          to {row.hospital?.name ?? 'hospital not recorded'}
        </p>
      </div>
    ),
  },
  { key: 'distance', header: 'Distance', cell: (row) => `${Number(row.distanceKm ?? 0)} km` },
  { key: 'fare', header: 'Fare', cell: (row) => formatMoney(row.fare ?? 0) },
  { key: 'payment', header: 'Payment', cell: (row) => <StatusBadge value={row.payment} /> },
  {
    key: 'actions',
    header: 'Actions',
    cell: (row) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/trips/${row.id}`}>View</Link>
      </Button>
    ),
  },
];

export function EarningsSummary() {
  const { get, set } = useUrlQuery();
  const { page, limit, setPage } = usePagination();
  const filter = FILTERS.find((item) => item.value === get('payment'))?.value;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.trips.mine({ status: 'COMPLETED', earnings: true }),
    queryFn: async () =>
      unwrap(await listMyTripsAction({ status: 'COMPLETED', limit: SCAN_LIMIT })).data.map(
        (trip): EarningRow => ({ ...trip, payment: paymentOf(trip) }),
      ),
    meta: { silent: true },
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
        <TableSkeleton columns={7} rows={5} />
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Could not load your earnings" onRetry={() => void refetch()} />;
  }

  const paid = data.filter((row) => row.payment === 'PAID');
  const awaiting = data.filter((row) => row.payment !== 'PAID');
  const rows = filter === 'paid' ? paid : filter === 'awaiting' ? awaiting : data;
  const total = rows.length;
  const pageRows = rows.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total fares" value={formatMoney(sumFares(data))} icon={Banknote} />
        <StatCard
          label="Collected"
          value={formatMoney(sumFares(paid))}
          icon={CircleCheck}
          tone="success"
          hint={`${paid.length} paid trips`}
        />
        <StatCard
          label="Awaiting payment"
          value={formatMoney(sumFares(awaiting))}
          icon={Clock}
          tone="warning"
          hint={`${awaiting.length} unpaid trips`}
        />
        <StatCard label="Completed trips" value={data.length} icon={Route} tone="info" />
      </div>
      <Select
        value={filter ?? ALL}
        onValueChange={(value) => set({ payment: value === ALL ? undefined : value })}
      >
        <SelectTrigger className="w-full sm:w-52" aria-label="Filter by payment">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All payments</SelectItem>
          {FILTERS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DataTable
        columns={columns}
        rows={pageRows}
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState
            icon={Banknote}
            title={filter ? 'No trips match this filter' : 'No completed trips yet'}
            message={
              filter
                ? 'Try another payment filter.'
                : 'Fares from trips you complete are totalled here.'
            }
          />
        }
      />
      {total > limit ? (
        <Pagination
          meta={{ page, limit, total, totalPage: Math.ceil(total / limit) }}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
