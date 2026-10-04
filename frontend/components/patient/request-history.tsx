'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Pencil, Siren, XCircle } from 'lucide-react';
import { listMyRequestsAction } from '@/app/actions/emergency-requests';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Button } from '@/components/ui/button';
import { usePagination } from '@/hooks/use-pagination';
import { unwrap } from '@/lib/api/action-result';
import type { EmergencyRequest } from '@/lib/api/types';
import { formatDateTime } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';
import { CancelRequestDialog } from './cancel-request-dialog';
import { EditRequestDialog } from './edit-request-dialog';

export function RequestHistory() {
  const { page, limit, setPage } = usePagination(5);
  const [editing, setEditing] = useState<EmergencyRequest | null>(null);
  const [cancelling, setCancelling] = useState<EmergencyRequest | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.emergencyRequests.list({ mine: true, page, limit }),
    queryFn: async () => unwrap(await listMyRequestsAction({ page, limit })),
    meta: { silent: true },
  });

  if (isPending) {
    return <TableSkeleton columns={5} rows={limit} />;
  }

  if (isError) {
    return <ErrorState title="Could not load your requests" onRetry={() => void refetch()} />;
  }

  const columns: Column<EmergencyRequest>[] = [
    { key: 'createdAt', header: 'Requested', cell: (row) => formatDateTime(row.createdAt) },
    {
      key: 'pickup',
      header: 'Pickup',
      cell: (row) => <span className="line-clamp-2 max-w-64">{row.pickupAddress}</span>,
    },
    { key: 'priority', header: 'Priority', cell: (row) => <StatusBadge value={row.priority} /> },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge value={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) =>
        row.status === 'PENDING' ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(row)}>
              <Pencil aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => setCancelling(row)}
            >
              <XCircle aria-hidden="true" />
              Cancel
            </Button>
          </div>
        ) : row.status === 'CANCELLED' && row.cancelReason ? (
          <span className="text-xs text-muted-foreground">{row.cancelReason}</span>
        ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={data.data}
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState
            icon={Siren}
            title="No emergency requests yet"
            message="When you request an ambulance it will appear here with its live status."
            action={
              <Button asChild>
                <Link href="/dashboard/request">Request an ambulance</Link>
              </Button>
            }
          />
        }
      />
      {data.meta && data.meta.total > 0 ? (
        <Pagination meta={data.meta} onPageChange={setPage} />
      ) : null}
      <EditRequestDialog request={editing} onClose={() => setEditing(null)} />
      <CancelRequestDialog request={cancelling} onClose={() => setCancelling(null)} />
    </div>
  );
}
