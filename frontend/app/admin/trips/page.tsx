import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TripMonitor } from '@/components/admin/trip-monitor';
import { TableSkeleton } from '@/components/shared/table-skeleton';

export const metadata: Metadata = { title: 'Trips' };

export default function AdminTripsPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={6} rows={6} />}>
      <TripMonitor />
    </Suspense>
  );
}
