import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDispatchLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-56" />
      <TableSkeleton columns={7} rows={5} />
    </div>
  );
}
