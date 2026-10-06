import type { Metadata } from 'next';
import { PaymentOutcome } from '@/components/patient/payment-outcome';

export const metadata: Metadata = { title: 'Payment cancelled' };

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const { paymentId } = await searchParams;

  return <PaymentOutcome paymentId={paymentId} />;
}
