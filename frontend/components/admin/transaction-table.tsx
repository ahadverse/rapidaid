'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Banknote, Clock, Receipt } from 'lucide-react';
import { getDashboardStatsAction } from '@/app/actions/admin';
import { listAllPaymentsAction } from '@/app/actions/payments';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { StatCard } from '@/components/shared/stat-card';
import { StatSkeleton } from '@/components/shared/stat-skeleton';
import { StatusBadge, formatStatus } from '@/components/shared/status-badge';
import { TableSkeleton } from '@/components/shared/table-skeleton';
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
import { PAYMENT_STATUSES, type Payment, type PaymentStatus } from '@/lib/api/types';
import { formatDateTime, formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const ALL = 'ALL';

const isPaymentStatus = (value: string): value is PaymentStatus =>
  (PAYMENT_STATUSES as readonly string[]).includes(value);

const columns: Column<Payment>[] = [
  {
    key: 'createdAt',
    header: 'Date',
    sortKey: 'createdAt',
    cell: (row) => formatDateTime(row.createdAt),
  },
  {
    key: 'transaction',
    header: 'Transaction',
    cell: (row) => <span className="font-mono text-xs">{row.transactionId}</span>,
  },
  {
    key: 'patient',
    header: 'Patient',
    cell: (row) =>
      row.patient ? (
        <div>
          <p className="font-medium">{row.patient.name}</p>
          <p className="text-xs text-muted-foreground">{row.patient.email}</p>
        </div>
      ) : (
        '—'
      ),
  },
  {
    key: 'trip',
    header: 'Trip',
    cell: (row) => (
      <Link href={`/trips/${row.trip.id}`} className="block hover:underline">
        <span className="text-primary">{row.trip.driver?.user.name ?? 'View trip'}</span>
        {row.trip.ambulance ? (
          <span className="block font-mono text-xs text-muted-foreground">
            {row.trip.ambulance.regNumber}
          </span>
        ) : null}
      </Link>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    sortKey: 'amount',
    cell: (row) => formatMoney(row.amount),
  },
  {
    key: 'status',
    header: 'Status',
    sortKey: 'status',
    cell: (row) => <StatusBadge value={row.status} />,
  },
  {
    key: 'paidAt',
    header: 'Paid at',
    sortKey: 'paidAt',
    cell: (row) => (row.paidAt ? formatDateTime(row.paidAt) : '—'),
  },
];

export function TransactionTable() {
  const { get, set } = useUrlQuery();
  const { page, limit, setPage } = usePagination();
  const { sortBy, sortOrder, setSort } = useUrlSort('createdAt', 'desc');
  const rawStatus = get('status');
  const status = isPaymentStatus(rawStatus) ? rawStatus : undefined;
  const params = { page, limit, status, sortBy, sortOrder };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.payments.list({ admin: true, ...params }),
    queryFn: async () => unwrap(await listAllPaymentsAction(params)),
    meta: { silent: true },
    placeholderData: (previous) => previous,
  });

  const stats = useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: async () => unwrap(await getDashboardStatsAction()).data,
    meta: { silent: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Every SSLCommerz payment across the platform, with its current status."
      />
      {stats.data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Collected"
            value={formatMoney(stats.data.revenue.collected)}
            icon={Banknote}
            tone="success"
            hint={`${stats.data.revenue.paidPayments} paid transactions`}
          />
          <StatCard
            label="Outstanding"
            value={formatMoney(stats.data.revenue.outstanding)}
            icon={Clock}
            tone="warning"
            hint={`${stats.data.revenue.pendingPayments} awaiting payment`}
          />
          <StatCard
            label="Transactions"
            value={data?.meta?.total ?? 0}
            icon={Receipt}
            tone="info"
            hint={status ? `${formatStatus(status)} only` : 'All statuses'}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
      )}
      <Select
        value={status ?? ALL}
        onValueChange={(value) => set({ status: value === ALL ? undefined : value })}
      >
        <SelectTrigger className="w-full sm:w-52" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {PAYMENT_STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {formatStatus(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending ? (
        <TableSkeleton columns={7} rows={6} />
      ) : isError ? (
        <ErrorState title="Could not load transactions" onRetry={() => void refetch()} />
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
                icon={Receipt}
                title="No transactions found"
                message={
                  status
                    ? 'No transactions match this status. Try another filter.'
                    : 'Payments appear here once patients pay for completed trips.'
                }
              />
            }
          />
          {data.meta && data.meta.totalPage > 1 ? (
            <Pagination meta={data.meta} onPageChange={setPage} />
          ) : null}
        </>
      )}
    </div>
  );
}
