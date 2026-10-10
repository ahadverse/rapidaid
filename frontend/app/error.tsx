'use client';

import { ErrorState } from '@/components/shared/error-state';

export default function GlobalRouteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 items-center justify-center px-4 py-16"
    >
      <ErrorState className="w-full max-w-md" onRetry={reset} />
    </main>
  );
}
