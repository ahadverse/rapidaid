import { CardSkeleton } from '@/components/shared/card-skeleton';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientPaymentsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        <CardSkeleton lines={2} />
        <CardSkeleton lines={2} />
      </div>
      <TableSkeleton columns={6} rows={5} />
    </div>
  );
}
