import { CardSkeleton } from '@/components/shared/card-skeleton';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientDashboardLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-64" />
      <TableSkeleton columns={5} rows={5} />
      <div className="grid gap-4 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
