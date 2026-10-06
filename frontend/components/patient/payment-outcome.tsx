import Link from 'next/link';
import { CircleCheck, CircleX, Clock, type LucideIcon } from 'lucide-react';
import { getPaymentAction } from '@/app/actions/payments';
import { ErrorState } from '@/components/shared/error-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PaymentStatus } from '@/lib/api/types';
import { formatDateTime, formatMoney } from '@/lib/format';

type View = { icon: LucideIcon; tone: string; title: string; message: string };

const VIEWS: Record<PaymentStatus, View> = {
  PAID: {
    icon: CircleCheck,
    tone: 'text-success',
    title: 'Payment confirmed',
    message: 'The gateway validated this payment and the trip is now settled.',
  },
  PENDING: {
    icon: Clock,
    tone: 'text-warning',
    title: 'Payment not confirmed yet',
    message: 'We have not received confirmation from the gateway. Refresh in a moment.',
  },
  FAILED: {
    icon: CircleX,
    tone: 'text-destructive',
    title: 'Payment failed',
    message: 'The gateway did not complete this payment. You have not been charged.',
  },
  CANCELLED: {
    icon: CircleX,
    tone: 'text-muted-foreground',
    title: 'Payment cancelled',
    message: 'You left the gateway before paying. You can try again from your payments page.',
  },
};

export async function PaymentOutcome({ paymentId }: { paymentId?: string }) {
  if (!paymentId) {
    return (
      <ErrorState
        title="No payment to show"
        message="This page needs a payment reference. Open your payments page to check the status."
      />
    );
  }

  const result = await getPaymentAction(paymentId);

  if (!result.ok) {
    return <ErrorState title="Could not load this payment" message={result.error} />;
  }

  const payment = result.data;
  const view = VIEWS[payment.status];
  const Icon = view.icon;

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="items-center text-center">
        <Icon className={`size-12 ${view.tone}`} aria-hidden="true" />
        <CardTitle className="text-xl">{view.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{view.message}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge value={payment.status} />
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Amount</dt>
            <dd>{formatMoney(payment.amount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Transaction</dt>
            <dd className="break-all text-right font-mono text-xs">{payment.transactionId}</dd>
          </div>
          {payment.paidAt ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Paid at</dt>
              <dd>{formatDateTime(payment.paidAt)}</dd>
            </div>
          ) : null}
        </dl>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/dashboard/payments">Back to payments</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/trips/${payment.trip.id}`}>View trip</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
