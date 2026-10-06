'use client';

import { ErrorState } from '@/components/shared/error-state';

export default function PaymentError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState onRetry={reset} />;
}
