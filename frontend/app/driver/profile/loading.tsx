import { CardSkeleton } from '@/components/shared/card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function DriverProfileLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
    </div>
  );
}
