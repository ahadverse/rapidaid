import type { Metadata } from 'next';
import { AdminOverview } from '@/components/admin/admin-overview';
import { PageHeader } from '@/components/shared/page-header';

export const metadata: Metadata = { title: 'Admin overview' };

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Live picture of requests, trips, fleet and revenue."
      />
      <AdminOverview />
    </div>
  );
}
