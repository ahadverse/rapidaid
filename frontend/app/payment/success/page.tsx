import type { Metadata } from 'next';
import { PaymentOutcome } from '@/components/patient/payment-outcome';

export const metadata: Metadata = { title: 'Payment confirmed' };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const { paymentId } = await searchParams;

  return <PaymentOutcome paymentId={paymentId} />;
}
