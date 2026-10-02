'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type QueryValue = string | number | boolean | null | undefined;

export function useUrlQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback((key: string) => searchParams.get(key) ?? '', [searchParams]);

  const set = useCallback(
    (updates: Record<string, QueryValue>) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === null || value === '') {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      // A new filter, sort or search can shrink the result set, so page 1 is the only safe landing.
      if (!('page' in updates)) {
        next.delete('page');
      }

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const reset = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  return { searchParams, get, set, reset };
}
