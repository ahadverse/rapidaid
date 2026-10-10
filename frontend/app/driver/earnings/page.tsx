import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EarningsSummary } from '@/components/driver/earnings-summary';
import { PageHeader } from '@/components/shared/page-header';
import { TableSkeleton } from '@/components/shared/table-skeleton';

export const metadata: Metadata = { title: 'Earnings' };

export default function DriverEarningsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings"
        description="Fares from every trip you have completed and whether the patient has paid."
      />
      <Suspense fallback={<TableSkeleton columns={7} rows={5} />}>
        <EarningsSummary />
      </Suspense>
    </div>
  );
}
