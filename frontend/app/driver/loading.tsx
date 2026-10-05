import { CardSkeleton } from '@/components/shared/card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function DriverLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-9 w-48" />
      <CardSkeleton lines={2} />
      <div className="grid gap-4 lg:grid-cols-2">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
    </div>
  );
}
