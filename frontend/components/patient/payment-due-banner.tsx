'use client';

import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { PayNowButton } from '@/components/patient/pay-now-button';
import { Button } from '@/components/ui/button';
import { useUnpaidTrips } from '@/hooks/use-unpaid-trips';
import { formatMoney } from '@/lib/format';

export function PaymentDueBanner() {
  const { data } = useUnpaidTrips();

  if (!data || data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, trip) => sum + Number(trip.fare ?? 0), 0);

  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <CreditCard className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
        <div>
          <p className="font-medium">Payment due: {formatMoney(total)}</p>
          <p className="text-sm text-muted-foreground">
            {data.length === 1
              ? 'Your completed trip is waiting for payment.'
              : `${data.length} completed trips are waiting for payment.`}
          </p>
        </div>
      </div>
      {data.length === 1 ? (
        <PayNowButton tripId={data[0].id} />
      ) : (
        <Button size="sm" asChild>
          <Link href="/dashboard/payments">Review and pay</Link>
        </Button>
      )}
    </div>
  );
}
