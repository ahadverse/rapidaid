import type { Metadata } from 'next';
import { EarningsSummary } from '@/components/driver/earnings-summary';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = { title: 'Earnings' };

export default function DriverEarningsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Earnings" description="Fares from every trip you have completed." />
      <EarningsSummary />
    </div>
  );
}
