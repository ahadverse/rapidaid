'use client';

import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { PayNowButton } from '@/components/patient/pay-now-button';
import { CardSkeleton } from '@/components/shared/card-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnpaidTrips } from '@/hooks/use-unpaid-trips';
import { formatDateTime, formatMoney } from '@/lib/format';

export function UnpaidTrips() {
  const { data, isPending, isError, refetch } = useUnpaidTrips();

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <CardSkeleton lines={2} />
        <CardSkeleton lines={2} />
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Could not load unpaid trips" onRetry={() => void refetch()} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="Nothing to pay"
        message="Completed trips with an outstanding fare show up here."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.map((trip) => (
        <Card key={trip.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-base">
              <span>{formatMoney(trip.fare ?? 0)}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {trip.completedAt ? formatDateTime(trip.completedAt) : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="line-clamp-2">{trip.request.pickupAddress}</p>
            <div className="flex items-center justify-between gap-2">
              <Link href={`/trips/${trip.id}`} className="text-primary hover:underline">
                View trip
              </Link>
              <PayNowButton tripId={trip.id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
