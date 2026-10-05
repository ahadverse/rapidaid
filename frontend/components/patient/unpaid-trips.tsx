'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { listMyPaymentsAction } from '@/app/actions/payments';
import { listMyTripsAction } from '@/app/actions/trips';
import { PayNowButton } from '@/components/patient/pay-now-button';
import { CardSkeleton } from '@/components/shared/card-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { unwrap } from '@/lib/api/action-result';
import { formatDateTime, formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const SCAN_LIMIT = 100;

export function UnpaidTrips() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.trips.mine({ status: 'COMPLETED', unpaid: true }),
    queryFn: async () => {
      const [trips, paid] = await Promise.all([
        listMyTripsAction({ status: 'COMPLETED', limit: SCAN_LIMIT }),
        listMyPaymentsAction({ status: 'PAID', page: 1, limit: SCAN_LIMIT }),
      ]);
      const paidTripIds = new Set(unwrap(paid).data.map((payment) => payment.trip.id));

      return unwrap(trips).data.filter((trip) => trip.fare !== null && !paidTripIds.has(trip.id));
    },
    meta: { silent: true },
  });

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
