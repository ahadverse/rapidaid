import { CardSkeleton } from '@/components/shared/card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientProfileLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
    </div>
  );
}
