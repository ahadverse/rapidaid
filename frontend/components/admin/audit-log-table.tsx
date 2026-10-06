'use client';

import { useQuery } from '@tanstack/react-query';
import { ScrollText, X } from 'lucide-react';
import { listAuditLogsAction } from '@/app/actions/admin';
import { DataTable, type Column } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PageHeader } from '@/components/shared/page-header';
import { Pagination } from '@/components/shared/pagination';
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
import { unwrap } from '@/lib/api/action-result';
import type { AuditLog } from '@/lib/api/types';
import { formatDateTime } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const ALL = 'ALL';
const ENTITIES = ['EmergencyRequest', 'Trip', 'Payment'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function AuditLogTable() {
  const { get, set } = useUrlQuery();
  const { page, limit, setPage } = usePagination();

  const rawEntity = get('entity');
  const rawActor = get('actorId');
  const entity = (ENTITIES as readonly string[]).includes(rawEntity) ? rawEntity : undefined;
  const actorId = UUID.test(rawActor) ? rawActor : undefined;

  const params = { page, limit, entity, actorId };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.admin.auditLogs(params),
    queryFn: async () => unwrap(await listAuditLogsAction(params)),
    meta: { silent: true },
    placeholderData: (previous) => previous,
  });

  const actorName = data?.data.find((log) => log.actor?.id === actorId)?.actor?.name;

  const columns: Column<AuditLog>[] = [
    { key: 'createdAt', header: 'When', cell: (row) => formatDateTime(row.createdAt) },
    {
      key: 'actor',
      header: 'Actor',
      cell: (row) =>
        row.actor ? (
          <div className="space-y-0.5">
            <Button
              variant="link"
              className="h-auto p-0"
              aria-label={`Show only actions by ${row.actor.name}`}
              onClick={() => set({ actorId: row.actor?.id })}
            >
              {row.actor.name}
            </Button>
            <div>
              <StatusBadge value={row.actor.role} />
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">System</span>
        ),
    },
    {
      key: 'action',
      header: 'Action',
      cell: (row) => <Badge variant="secondary">{row.action}</Badge>,
    },
    {
      key: 'entity',
      header: 'Entity',
      cell: (row) => (
        <div>
          <p>{row.entity}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.entityId.slice(0, 8)}</p>
        </div>
      ),
    },
    {
      key: 'change',
      header: 'Change',
      cell: (row) => (
        <pre className="max-w-80 overflow-x-auto font-mono text-xs whitespace-pre-wrap">
          {JSON.stringify({ before: row.before, after: row.after }, null, 1)}
        </pre>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit logs" description="Who changed what, newest first." />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={entity ?? ALL}
          onValueChange={(value) => set({ entity: value === ALL ? undefined : value })}
        >
          <SelectTrigger className="w-full sm:w-52" aria-label="Filter by entity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All entities</SelectItem>
            {ENTITIES.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {actorId ? (
          <Button variant="outline" size="sm" onClick={() => set({ actorId: undefined })}>
            Actor: {actorName ?? 'selected'}
            <X aria-hidden="true" />
            <span className="sr-only">Clear actor filter</span>
          </Button>
        ) : null}
      </div>
      {isPending ? (
        <TableSkeleton columns={5} rows={6} />
      ) : isError ? (
        <ErrorState title="Could not load audit logs" onRetry={() => void refetch()} />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data.data}
            getRowId={(row) => row.id}
            emptyState={
              <EmptyState
                icon={ScrollText}
                title="No audit entries"
                message={
                  entity || actorId
                    ? 'No entries match these filters. Try clearing them.'
                    : 'Dispatches, completed trips and payments are recorded here.'
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
