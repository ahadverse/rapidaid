import { Skeleton } from '@/components/ui/skeleton';

export default function NewRequestLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
