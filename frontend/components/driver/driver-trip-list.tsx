'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { MapPin, Route } from 'lucide-react';
import { listMyTripsAction } from '@/app/actions/trips';
import { CardSkeleton } from '@/components/shared/card-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePagination } from '@/hooks/use-pagination';
import { unwrap } from '@/lib/api/action-result';
import type { Trip } from '@/lib/api/types';
import { formatDateTime, formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';
import { FINAL_TRIP_STATUSES } from '@/lib/trip-flow';
import { CompleteTripDialog } from './complete-trip-dialog';
import { TripActions } from './trip-actions';
import { TripProgress } from './trip-progress';

const POLL_INTERVAL_MS = 15_000;

export function DriverTripList() {
  const { page, limit, setPage } = usePagination(6);
  const [completing, setCompleting] = useState<Trip | null>(null);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.trips.mine({ driver: true, page, limit }),
    queryFn: async () => unwrap(await listMyTripsAction({ page, limit })),
    refetchInterval: POLL_INTERVAL_MS,
    meta: { silent: true },
  });

  if (isPending) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
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
        title="No trips assigned"
        message="When dispatch assigns you a request, the trip appears here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {data.data.map((trip) => (
          <Card key={trip.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">{trip.request.patient.name}</CardTitle>
              <StatusBadge value={trip.status} />
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {trip.request.pickupAddress}
                </p>
                <p className="text-muted-foreground">{trip.request.patientCondition}</p>
                <p className="text-muted-foreground">
                  Dispatched {formatDateTime(trip.dispatchedAt)}
                </p>
              </div>
              {FINAL_TRIP_STATUSES.includes(trip.status) ? (
                trip.fare ? (
                  <p className="font-medium">Fare {formatMoney(trip.fare)}</p>
                ) : null
              ) : (
                <>
                  <TripProgress status={trip.status} />
                  <TripActions trip={trip} onComplete={setCompleting} />
                </>
              )}
              <Link
                href={`/trips/${trip.id}`}
                className="inline-block text-primary hover:underline"
              >
                View details
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {data.meta && data.meta.totalPage > 1 ? (
        <Pagination meta={data.meta} onPageChange={setPage} />
      ) : null}
      <CompleteTripDialog trip={completing} onClose={() => setCompleting(null)} />
    </div>
  );
}
