'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, UserCog } from 'lucide-react';
import { useState } from 'react';
import { listDriversPageAction } from '@/app/actions/drivers';
import { DriverFormDialog } from '@/components/admin/driver-form-dialog';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { StatusBadge } from '@/components/shared/status-badge';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Badge } from '@/components/ui/badge';
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
import type { DriverProfile } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';

const ALL = 'ALL';

export function DriverTable() {
  const { get, set } = useUrlQuery();
  const { page, limit, setPage } = usePagination();
  const { sortBy, sortOrder, setSort } = useUrlSort('createdAt', 'desc');
  const search = useUrlSearch();
  const [creating, setCreating] = useState(false);

  const rawAvailable = get('isAvailable');
  const isAvailable: 'true' | 'false' | undefined =
    rawAvailable === 'true' ? 'true' : rawAvailable === 'false' ? 'false' : undefined;

  const params = {
    page,
    limit,
    searchTerm: search.applied || undefined,
    isAvailable,
    sortBy,
    sortOrder,
  };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.drivers.list(params),
    queryFn: async () => unwrap(await listDriversPageAction(params)),
    meta: { silent: true },
    placeholderData: (previous) => previous,
  });

  const columns: Column<DriverProfile>[] = [
    {
      key: 'name',
      header: 'Driver',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.user.email}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', cell: (row) => row.user.phone ?? '—' },
    {
      key: 'licenseNumber',
      header: 'License',
      sortKey: 'licenseNumber',
      cell: (row) => <span className="font-mono text-sm">{row.licenseNumber}</span>,
    },
    {
      key: 'ambulance',
      header: 'Ambulance',
      cell: (row) =>
        row.ambulance ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{row.ambulance.regNumber}</span>
            <StatusBadge value={row.ambulance.type} />
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        ),
    },
    {
      key: 'isAvailable',
      header: 'Availability',
      sortKey: 'isAvailable',
      cell: (row) => (
        <Badge variant={row.isAvailable ? 'secondary' : 'outline'}>
          {row.isAvailable ? 'Free for dispatch' : 'Unavailable'}
        </Badge>
      ),
    },
    { key: 'status', header: 'Account', cell: (row) => <StatusBadge value={row.user.status} /> },
  ];

  const filtered = Boolean(search.applied || isAvailable);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drivers"
        description="Crews dispatch can assign, and the ambulance each one holds."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus aria-hidden="true" />
            Add driver
          </Button>
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={search.value}
          onChange={search.setValue}
          placeholder="Search name, email or license"
          label="Search drivers"
        />
        <Select
          value={isAvailable ?? ALL}
          onValueChange={(value) => set({ isAvailable: value === ALL ? undefined : value })}
        >
          <SelectTrigger className="w-full sm:w-52" aria-label="Filter by availability">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All drivers</SelectItem>
            <SelectItem value="true">Free for dispatch</SelectItem>
            <SelectItem value="false">Unavailable</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isPending ? (
        <TableSkeleton columns={6} rows={6} />
      ) : isError ? (
        <ErrorState title="Could not load drivers" onRetry={() => void refetch()} />
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
                icon={UserCog}
                title="No drivers found"
                message={
                  filtered
                    ? 'No drivers match these filters. Try widening them.'
                    : 'Add the first driver so dispatch has a crew to assign.'
                }
              />
            }
          />
          {data.meta && data.meta.totalPage > 1 ? (
            <Pagination meta={data.meta} onPageChange={setPage} />
          ) : null}
        </>
      )}
      <DriverFormDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
