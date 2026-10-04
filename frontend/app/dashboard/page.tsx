import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import { RequestHistory } from '@/components/patient/request-history';
import { TripHistory } from '@/components/patient/trip-history';
import { PageHeader } from '@/components/shared/page-header';
import { TableSkeleton } from '@/components/shared/table-skeleton';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'My requests' };

export default function PatientDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="My requests"
        description="Track your emergency requests and the ambulances sent to them."
        actions={
          <Button asChild>
            <Link href="/dashboard/request">
              <Plus aria-hidden="true" />
              New request
            </Link>
          </Button>
        }
      />
      <section aria-labelledby="requests-heading" className="space-y-3">
        <h2 id="requests-heading" className="text-lg font-semibold">
          Request history
        </h2>
        <Suspense fallback={<TableSkeleton columns={5} rows={5} />}>
          <RequestHistory />
        </Suspense>
      </section>
      <section aria-labelledby="trips-heading" className="space-y-3">
        <h2 id="trips-heading" className="text-lg font-semibold">
          Recent trips
        </h2>
        <TripHistory />
      </section>
    </div>
  );
}
