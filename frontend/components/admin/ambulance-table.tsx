'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ambulance, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  deleteAmbulanceAction,
  listAmbulancesPageAction,
  updateAmbulanceStatusAction,
} from '@/app/actions/ambulances';
import {
  AmbulanceFormDialog,
  type AmbulanceDialogState,
} from '@/components/admin/ambulance-form-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { StatusBadge, formatStatus } from '@/components/shared/status-badge';
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
import { useUrlSearch } from '@/hooks/use-url-search';
import { useUrlSort } from '@/hooks/use-url-sort';
import { unwrap } from '@/lib/api/action-result';
import {
  AMBULANCE_STATUSES,
  AMBULANCE_TYPES,
  type AmbulanceRecord,
  type AmbulanceStatus,
  type AmbulanceType,
} from '@/lib/api/types';
import { formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const ALL = 'ALL';
const MANUAL_STATUSES = AMBULANCE_STATUSES.filter((status) => status !== 'ON_TRIP');

const isType = (value: string): value is AmbulanceType =>
  (AMBULANCE_TYPES as readonly string[]).includes(value);
const isStatus = (value: string): value is AmbulanceStatus =>
  (AMBULANCE_STATUSES as readonly string[]).includes(value);

export function AmbulanceTable() {
  const queryClient = useQueryClient();
  const { get, set } = useUrlQuery();
  const { page, limit, setPage } = usePagination();
  const { sortBy, sortOrder, setSort } = useUrlSort('createdAt', 'desc');
  const search = useUrlSearch();
  const station = useUrlSearch('stationArea');
  const [dialog, setDialog] = useState<AmbulanceDialogState>(null);
  const [pendingDelete, setPendingDelete] = useState<AmbulanceRecord | null>(null);

  const rawType = get('type');
  const rawStatus = get('status');
  const type = isType(rawType) ? rawType : undefined;
  const status = isStatus(rawStatus) ? rawStatus : undefined;
  const stationArea = station.applied || undefined;

  const params = {
    page,
    limit,
    searchTerm: search.applied || undefined,
    type,
    status,
    stationArea,
    sortBy,
    sortOrder,
  };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.ambulances.list(params),
    queryFn: async () => unwrap(await listAmbulancesPageAction(params)),
    meta: { silent: true },
    placeholderData: (previous) => previous,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });

  const changeStatus = useMutation({
    mutationFn: async (input: { id: string; status: AmbulanceStatus }) =>
      unwrap(await updateAmbulanceStatusAction(input.id, input.status)),
    onSuccess: () => {
      toast.success('Status updated');
      void refresh();
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteAmbulanceAction(id)),
    onSuccess: () => {
      toast.success('Ambulance removed');
      void refresh();
      setPendingDelete(null);
    },
    onError: () => setPendingDelete(null),
  });

  const columns: Column<AmbulanceRecord>[] = [
    {
      key: 'regNumber',
      header: 'Registration',
      sortKey: 'regNumber',
      cell: (row) => <span className="font-mono text-sm">{row.regNumber}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      sortKey: 'type',
      cell: (row) => <StatusBadge value={row.type} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      cell: (row) =>
        row.status === 'ON_TRIP' ? (
          <StatusBadge value={row.status} />
        ) : (
          <Select
            value={row.status}
            onValueChange={(value) =>
              isStatus(value) && changeStatus.mutate({ id: row.id, status: value })
            }
          >
            <SelectTrigger size="sm" className="w-36" aria-label={`Status of ${row.regNumber}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MANUAL_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {formatStatus(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
    },
    {
      key: 'stationArea',
      header: 'Station',
      sortKey: 'stationArea',
      cell: (row) => row.stationArea,
    },
    {
      key: 'baseFare',
      header: 'Base fare',
      sortKey: 'baseFare',
      cell: (row) => formatMoney(row.baseFare),
    },
    {
      key: 'perKmRate',
      header: 'Per km',
      sortKey: 'perKmRate',
      cell: (row) => formatMoney(row.perKmRate),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${row.regNumber}`}
            onClick={() => setDialog({ ambulance: row })}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${row.regNumber}`}
            onClick={() => setPendingDelete(row)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const filtered = Boolean(search.applied || type || status || stationArea);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ambulances"
        description="The fleet dispatch draws from."
        actions={
          <Button onClick={() => setDialog({ ambulance: null })}>
            <Plus aria-hidden="true" />
            Add ambulance
          </Button>
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={search.value}
          onChange={search.setValue}
          placeholder="Search registration number"
          label="Search ambulances"
        />
        <Select
          value={type ?? ALL}
          onValueChange={(value) => set({ type: value === ALL ? undefined : value })}
        >
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {AMBULANCE_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {formatStatus(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status ?? ALL}
          onValueChange={(value) => set({ status: value === ALL ? undefined : value })}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {AMBULANCE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {formatStatus(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SearchInput
          value={station.value}
          onChange={station.setValue}
          placeholder="Station area"
          label="Filter by station area"
        />
      </div>
      {isPending ? (
        <TableSkeleton columns={7} rows={6} />
      ) : isError ? (
        <ErrorState title="Could not load ambulances" onRetry={() => void refetch()} />
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
                icon={Ambulance}
                title="No ambulances found"
                message={
                  filtered
                    ? 'No ambulances match these filters. Try widening them.'
                    : 'Add the first ambulance to build the fleet.'
                }
              />
            }
          />
          {data.meta && data.meta.totalPage > 1 ? (
            <Pagination meta={data.meta} onPageChange={setPage} />
          ) : null}
        </>
      )}
      <AmbulanceFormDialog state={dialog} onClose={() => setDialog(null)} />
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete ambulance?"
        description={`${pendingDelete?.regNumber ?? 'This ambulance'} is soft deleted: it leaves the fleet and dispatch pool, and past trips keep their record. An ambulance on an active trip cannot be deleted.`}
        confirmLabel="Delete ambulance"
        pending={remove.isPending}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
