import { StatSkeleton } from '@/components/shared/stat-skeleton';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminTransactionsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <Skeleton className="h-9 w-full sm:w-52" />
      <TableSkeleton columns={7} rows={6} />
    </div>
  );
}
