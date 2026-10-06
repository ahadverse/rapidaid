'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Ambulance, Send, UserRound } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { dispatchRequestAction, listDispatchQueueAction } from '@/app/actions/emergency-requests';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { unwrap } from '@/lib/api/action-result';
import { PRIORITIES, type QueuedRequest, type Trip } from '@/lib/api/types';
import { formatDateTime } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const priorityRank = (priority: QueuedRequest['priority']) => PRIORITIES.indexOf(priority);

// Merged from two status queries, so the order has to be re-established here.
const byUrgency = (a: QueuedRequest, b: QueuedRequest) =>
  priorityRank(a.priority) - priorityRank(b.priority) ||
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

export function DispatchConsole() {
  const queryClient = useQueryClient();
  const [dispatched, setDispatched] = useState<Trip | null>(null);
  const queueKey = queryKeys.emergencyRequests.list({ queue: true });

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queueKey,
    queryFn: async () => unwrap(await listDispatchQueueAction()).data.sort(byUrgency),
    meta: { silent: true },
  });

  const dispatch = useMutation({
    mutationFn: async (id: string) => unwrap(await dispatchRequestAction(id)).data,
    onSuccess: (trip) => {
      toast.success('Ambulance dispatched');
      setDispatched(trip);
    },
    // A 409 means the queue on screen is stale, so it is reloaded either way.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.emergencyRequests.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });
    },
  });

  const columns: Column<QueuedRequest>[] = [
    { key: 'priority', header: 'Priority', cell: (row) => <StatusBadge value={row.priority} /> },
    {
      key: 'patient',
      header: 'Patient',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.patient.name}</p>
          {row.patient.phone ? (
            <p className="text-xs text-muted-foreground">{row.patient.phone}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'pickup',
      header: 'Pickup and condition',
      cell: (row) => (
        <div className="max-w-72">
          <p className="line-clamp-1">{row.pickupAddress}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{row.patientCondition}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      cell: (row) =>
        row.requestedAmbulanceType ? <StatusBadge value={row.requestedAmbulanceType} /> : 'Any',
    },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge value={row.status} /> },
    { key: 'createdAt', header: 'Requested', cell: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <Button
          size="sm"
          disabled={dispatch.isPending}
          onClick={() => dispatch.mutate(row.id)}
          aria-label={`Dispatch ambulance for ${row.patient.name}`}
        >
          <Send aria-hidden="true" />
          {dispatch.isPending && dispatch.variables === row.id ? 'Dispatching...' : 'Dispatch'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispatch console"
        description="Requests waiting for an ambulance, most urgent first."
      />
      {isPending ? (
        <TableSkeleton columns={7} rows={5} />
      ) : isError ? (
        <ErrorState title="Could not load the dispatch queue" onRetry={() => void refetch()} />
      ) : (
        <DataTable
          columns={columns}
          rows={data}
          getRowId={(row) => row.id}
          emptyState={
            <EmptyState
              icon={Ambulance}
              title="The queue is clear"
              message="New emergency requests show up here the moment they are raised."
            />
          }
        />
      )}
      <Dialog open={dispatched !== null} onOpenChange={(open) => !open && setDispatched(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crew assigned</DialogTitle>
            <DialogDescription>
              The patient and the driver have both been notified.
            </DialogDescription>
          </DialogHeader>
          {dispatched ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                  <UserRound className="size-3.5" aria-hidden="true" />
                  Driver
                </dt>
                <dd className="font-medium">{dispatched.driver.user.name}</dd>
                <dd className="text-sm text-muted-foreground">{dispatched.driver.user.phone}</dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Ambulance className="size-3.5" aria-hidden="true" />
                  Ambulance
                </dt>
                <dd className="font-medium">{dispatched.ambulance.regNumber}</dd>
                <dd className="text-sm text-muted-foreground">
                  {dispatched.ambulance.type} · {dispatched.ambulance.stationArea}
                </dd>
              </div>
            </dl>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDispatched(null)}>
              Close
            </Button>
            {dispatched ? (
              <Button asChild>
                <Link href={`/trips/${dispatched.id}`}>View trip</Link>
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
