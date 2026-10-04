import { CardSkeleton } from '@/components/shared/card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function TripLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardSkeleton lines={6} />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton lines={2} />
        </div>
      </div>
    </div>
  );
}
