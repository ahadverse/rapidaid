import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminTripsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-9 w-full lg:w-52" />
      <TableSkeleton columns={6} rows={6} />
    </div>
  );
}
