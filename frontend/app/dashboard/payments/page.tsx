import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PaymentHistory } from '@/components/patient/payment-history';
import { UnpaidTrips } from '@/components/patient/unpaid-trips';
import { PageHeader } from '@/components/shared/page-header';
import { TableSkeleton } from '@/components/shared/table-skeleton';

export const metadata: Metadata = { title: 'Payments' };

export default function PatientPaymentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Pay for completed trips and follow every payment from pending to paid."
      />
      <section aria-labelledby="unpaid-heading" className="space-y-3">
        <h2 id="unpaid-heading" className="text-lg font-semibold">
          Awaiting payment
        </h2>
        <UnpaidTrips />
      </section>
      <section aria-labelledby="history-heading" className="space-y-3">
        <h2 id="history-heading" className="text-lg font-semibold">
          Payment history
        </h2>
        <Suspense fallback={<TableSkeleton columns={6} rows={5} />}>
          <PaymentHistory />
        </Suspense>
      </section>
    </div>
  );
}
