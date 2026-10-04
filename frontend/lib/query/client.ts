import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const MAX_RETRIES = 2;
const NO_RETRY_BELOW = 500;

function notify(error: unknown) {
  toast.error(error instanceof Error ? error.message : 'Something went wrong');
}

// A client error will fail the same way again, so only transient failures are worth retrying.
function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as { statusCode?: number }).statusCode;

  if (typeof status === 'number' && status < NO_RETRY_BELOW && status !== 0) {
    return false;
  }

  return failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!query.meta?.silent) {
          notify(error);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!mutation.meta?.silent) {
          notify(error);
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
    },
  });
}
