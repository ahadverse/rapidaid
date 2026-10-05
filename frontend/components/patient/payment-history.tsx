'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { listMyPaymentsAction } from '@/app/actions/payments';
import { PayNowButton } from '@/components/patient/pay-now-button';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Pagination } from '@/components/shared/pagination';
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
import { unwrap } from '@/lib/api/action-result';
import { PAYMENT_STATUSES, type Payment, type PaymentStatus } from '@/lib/api/types';
import { formatDateTime, formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const ALL = 'ALL';

const isPaymentStatus = (value: string): value is PaymentStatus =>
  (PAYMENT_STATUSES as readonly string[]).includes(value);

export function PaymentHistory() {
  const { get, set } = useUrlQuery();
  const { page, limit, setPage } = usePagination();
  const rawStatus = get('status');
  const status = isPaymentStatus(rawStatus) ? rawStatus : undefined;

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.payments.list({ page, limit, status }),
    queryFn: async () => unwrap(await listMyPaymentsAction({ page, limit, status })),
    meta: { silent: true },
  });

  const columns: Column<Payment>[] = [
    { key: 'createdAt', header: 'Date', cell: (row) => formatDateTime(row.createdAt) },
    {
      key: 'trip',
      header: 'Trip',
      cell: (row) => (
        <Link href={`/trips/${row.trip.id}`} className="text-primary hover:underline">
          {row.trip.hospital?.name ?? 'View trip'}
        </Link>
      ),
    },
    { key: 'amount', header: 'Amount', cell: (row) => formatMoney(row.amount) },
    {
      key: 'transaction',
      header: 'Transaction',
      cell: (row) => <span className="font-mono text-xs">{row.transactionId}</span>,
    },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge value={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) =>
        row.status === 'PAID' ? (
          row.paidAt ? (
            <span className="text-xs text-muted-foreground">{formatDateTime(row.paidAt)}</span>
          ) : null
        ) : (
          <PayNowButton tripId={row.trip.id} label="Retry" />
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="max-w-48">
        <Select
          value={status ?? ALL}
          onValueChange={(value) => set({ status: value === ALL ? undefined : value })}
        >
          <SelectTrigger className="w-full" aria-label="Filter by status">
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
      </div>
      {isPending ? (
        <TableSkeleton columns={6} rows={5} />
      ) : isError ? (
        <ErrorState title="Could not load your payments" onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data.data}
            getRowId={(row) => row.id}
            emptyState={
              <EmptyState
                icon={CreditCard}
                title="No payments found"
                message={
                  status
                    ? 'No payments match this status. Try another filter.'
                    : 'Payments for your completed trips appear here.'
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
