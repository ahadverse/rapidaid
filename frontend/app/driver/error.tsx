'use client';

import { ErrorState } from '@/components/shared/error-state';

export default function DriverError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState onRetry={reset} />;
}
