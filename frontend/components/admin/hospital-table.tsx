'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteHospitalAction, listHospitalsPageAction } from '@/app/actions/hospitals';
import {
  HospitalFormDialog,
  type HospitalDialogState,
} from '@/components/admin/hospital-form-dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePagination } from '@/hooks/use-pagination';
import { useUrlSearch } from '@/hooks/use-url-search';
import { useUrlSort } from '@/hooks/use-url-sort';
import { unwrap } from '@/lib/api/action-result';
import type { Hospital } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';

export function HospitalTable() {
  const queryClient = useQueryClient();
  const { page, limit, setPage } = usePagination();
  const { sortBy, sortOrder, setSort } = useUrlSort('name', 'asc');
  const search = useUrlSearch();
  const [dialog, setDialog] = useState<HospitalDialogState>(null);
  const [pendingDelete, setPendingDelete] = useState<Hospital | null>(null);

  const params = { page, limit, searchTerm: search.applied || undefined, sortBy, sortOrder };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.hospitals.list(params),
    queryFn: async () => unwrap(await listHospitalsPageAction(params)),
    meta: { silent: true },
    placeholderData: (previous) => previous,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteHospitalAction(id)),
    onSuccess: () => {
      toast.success('Hospital removed');
      void queryClient.invalidateQueries({ queryKey: queryKeys.hospitals.all });
      setPendingDelete(null);
    },
  });

  const columns: Column<Hospital>[] = [
    {
      key: 'name',
      header: 'Hospital',
      sortKey: 'name',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.address}</p>
        </div>
      ),
    },
    { key: 'area', header: 'Area', sortKey: 'area', cell: (row) => row.area },
    { key: 'phone', header: 'Phone', cell: (row) => row.phone },
    {
      key: 'specializations',
      header: 'Specializations',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.specializations.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'beds',
      header: 'Beds',
      sortKey: 'availableBeds',
      cell: (row) => <span className="tabular-nums">{row.availableBeds}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${row.name}`}
            onClick={() => setDialog({ hospital: row })}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${row.name}`}
            onClick={() => setPendingDelete(row)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospitals"
        description="Destinations drivers can route patients to."
        actions={
          <Button onClick={() => setDialog({ hospital: null })}>
            <Plus aria-hidden="true" />
            Add hospital
          </Button>
        }
      />
      <SearchInput
        value={search.value}
        onChange={search.setValue}
        placeholder="Search name, area or address"
        label="Search hospitals"
      />
      {isPending ? (
        <TableSkeleton columns={6} rows={6} />
      ) : isError ? (
        <ErrorState title="Could not load hospitals" onRetry={() => void refetch()} />
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
                icon={Building2}
                title="No hospitals found"
                message={
                  search.applied
                    ? 'Nothing matches this search. Try a different term.'
                    : 'Add the first hospital to start routing trips.'
                }
              />
            }
          />
          {data.meta && data.meta.totalPage > 1 ? (
            <Pagination meta={data.meta} onPageChange={setPage} />
          ) : null}
        </>
      )}
      <HospitalFormDialog state={dialog} onClose={() => setDialog(null)} />
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete hospital?"
        description={`${pendingDelete?.name ?? 'This hospital'} is soft deleted: it disappears from the list and the driver picker, and past trips keep their record.`}
        confirmLabel="Delete hospital"
        pending={remove.isPending}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
