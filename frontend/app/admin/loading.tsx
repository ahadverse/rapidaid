import { CardSkeleton } from '@/components/shared/card-skeleton';
import { StatSkeleton } from '@/components/shared/stat-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
      <CardSkeleton lines={6} />
    </div>
  );
}
