import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminAuditLogsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-9 w-full sm:w-52" />
      <TableSkeleton columns={5} rows={6} />
    </div>
  );
}
