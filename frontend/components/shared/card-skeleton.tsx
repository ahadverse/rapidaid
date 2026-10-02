import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type CardSkeletonProps = {
  lines?: number;
};

export function CardSkeleton({ lines = 3 }: CardSkeletonProps) {
  return (
    <Card role="status" aria-label="Loading">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton key={index} className={index === lines - 1 ? 'h-4 w-2/3' : 'h-4 w-full'} />
        ))}
      </CardContent>
    </Card>
  );
}
