'use client';

import { ErrorState } from '@/components/shared/error-state';

export default function TripError({ retry }: { error: Error; retry: () => void }) {
  return <ErrorState title="Could not load this trip" onRetry={retry} />;
}
