import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AmbulanceStatusControl } from '@/components/driver/ambulance-status-control';
import { DriverTripList } from '@/components/driver/driver-trip-list';
import { CardSkeleton } from '@/components/shared/card-skeleton';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = { title: 'My trips' };

export default function DriverTripsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="My trips"
        description="Move each trip forward one step at a time as you progress."
      />
      <AmbulanceStatusControl />
      <section aria-labelledby="driver-trips-heading" className="space-y-3">
        <h2 id="driver-trips-heading" className="text-lg font-semibold">
          Assigned trips
        </h2>
        <Suspense fallback={<CardSkeleton />}>
          <DriverTripList />
        </Suspense>
      </section>
    </div>
  );
}
