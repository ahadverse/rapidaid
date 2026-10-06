'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteUserAction, listUsersAction, updateUserStatusAction } from '@/app/actions/users';
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
import { useAuth } from '@/hooks/use-auth';
import { usePagination } from '@/hooks/use-pagination';
import { useUrlQuery } from '@/hooks/use-url-query';
import { useUrlSearch } from '@/hooks/use-url-search';
import { useUrlSort } from '@/hooks/use-url-sort';
import { unwrap } from '@/lib/api/action-result';
import {
  ROLES,
  USER_STATUSES,
  type Role,
  type UserProfile,
  type UserStatus,
} from '@/lib/api/types';
import { formatDateTime } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const ALL = 'ALL';

const isRole = (value: string): value is Role => (ROLES as readonly string[]).includes(value);
const isUserStatus = (value: string): value is UserStatus =>
  (USER_STATUSES as readonly string[]).includes(value);

export function UserTable() {
  const queryClient = useQueryClient();
  const { user: session } = useAuth();
  const { get, set } = useUrlQuery();
  const { page, limit, setPage } = usePagination();
  const { sortBy, sortOrder, setSort } = useUrlSort('createdAt', 'desc');
  const search = useUrlSearch();
  const [pendingDelete, setPendingDelete] = useState<UserProfile | null>(null);

  const rawRole = get('role');
  const rawStatus = get('status');
  const role = isRole(rawRole) ? rawRole : undefined;
  const status = isUserStatus(rawStatus) ? rawStatus : undefined;

  const params = {
    page,
    limit,
    searchTerm: search.applied || undefined,
    role,
    status,
    sortBy,
    sortOrder,
  };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => unwrap(await listUsersAction(params)),
    meta: { silent: true },
    placeholderData: (previous) => previous,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

  const changeStatus = useMutation({
    mutationFn: async (input: { id: string; status: UserStatus }) =>
      unwrap(await updateUserStatusAction(input.id, input.status)),
    onSuccess: (_result, input) => {
      toast.success(input.status === 'BLOCKED' ? 'User blocked' : 'User unblocked');
      void refresh();
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => unwrap(await deleteUserAction(id)),
    onSuccess: () => {
      toast.success('User deleted');
      void refresh();
      setPendingDelete(null);
    },
  });

  const columns: Column<UserProfile>[] = [
    {
      key: 'name',
      header: 'User',
      sortKey: 'name',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', cell: (row) => row.phone ?? '—' },
    {
      key: 'role',
      header: 'Role',
      sortKey: 'role',
      cell: (row) => <StatusBadge value={row.role} />,
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      cell: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Joined',
      sortKey: 'createdAt',
      cell: (row) => formatDateTime(row.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => {
        if (row.id === session?.id) {
          return <span className="text-xs text-muted-foreground">You</span>;
        }

        const blocked = row.status === 'BLOCKED';

        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={changeStatus.isPending}
              onClick={() =>
                changeStatus.mutate({ id: row.id, status: blocked ? 'ACTIVE' : 'BLOCKED' })
              }
            >
              {blocked ? <CheckCircle2 aria-hidden="true" /> : <Ban aria-hidden="true" />}
              {blocked ? 'Unblock' : 'Block'}
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
        );
      },
    },
  ];

  const filtered = Boolean(search.applied || role || status);

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Review accounts, block access or remove users." />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={search.value}
          onChange={search.setValue}
          placeholder="Search name or email"
          label="Search users"
        />
        <Select
          value={role ?? ALL}
          onValueChange={(value) => set({ role: value === ALL ? undefined : value })}
        >
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All roles</SelectItem>
            {ROLES.map((value) => (
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
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {USER_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {formatStatus(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isPending ? (
        <TableSkeleton columns={6} rows={6} />
      ) : isError ? (
        <ErrorState title="Could not load users" onRetry={() => void refetch()} />
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
                icon={Users}
                title="No users found"
                message={
                  filtered
                    ? 'No users match these filters. Try widening them.'
                    : 'Registered users appear here.'
                }
              />
            }
          />
          {data.meta && data.meta.totalPage > 1 ? (
            <Pagination meta={data.meta} onPageChange={setPage} />
          ) : null}
        </>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete user?"
        description={`${pendingDelete?.name ?? 'This user'} is soft deleted: they can no longer sign in, but their trips and payments stay on record.`}
        confirmLabel="Delete user"
        pending={remove.isPending}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
