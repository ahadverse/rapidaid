'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Ambulance, ArrowRight, Route } from 'lucide-react';
import { listMyTripsAction } from '@/app/actions/trips';
import { CardSkeleton } from '@/components/shared/card-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { unwrap } from '@/lib/api/action-result';
import { formatDateTime } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const TRIP_LIMIT = 4;

export function TripHistory() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.trips.mine({ limit: TRIP_LIMIT }),
    queryFn: async () => unwrap(await listMyTripsAction({ limit: TRIP_LIMIT })),
    meta: { silent: true },
  });

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Could not load your trips" onRetry={() => void refetch()} />;
  }

  if (data.data.length === 0) {
    return (
      <EmptyState
        icon={Route}
        title="No trips yet"
        message="Once an ambulance is dispatched to one of your requests, the trip shows up here."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.data.map((trip) => (
        <Card key={trip.id}>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Ambulance className="size-4" aria-hidden="true" />
              {trip.ambulance.regNumber}
            </CardTitle>
            <StatusBadge value={trip.status} />
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="line-clamp-2">{trip.request.pickupAddress}</p>
            <p className="text-muted-foreground">
              {trip.hospital ? `To ${trip.hospital.name}` : 'Hospital not selected yet'}
              {trip.dispatchedAt ? ` · Dispatched ${formatDateTime(trip.dispatchedAt)}` : ''}
            </p>
            <Link
              href={`/trips/${trip.id}`}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Track trip
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
