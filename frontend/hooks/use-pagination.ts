'use client';

import { useCallback } from 'react';
import { useUrlQuery } from './use-url-query';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function toPositiveInt(value: string, fallback: number): number {
  const parsed = Math.trunc(Number(value));

  return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback;
}

export function usePagination(defaultLimit = DEFAULT_LIMIT) {
  const { get, set } = useUrlQuery();

  const page = toPositiveInt(get('page'), 1);
  const limit = Math.min(toPositiveInt(get('limit'), defaultLimit), MAX_LIMIT);

  const setPage = useCallback((next: number) => set({ page: next <= 1 ? undefined : next }), [set]);

  const setLimit = useCallback(
    (next: number) => set({ limit: next === defaultLimit ? undefined : next }),
    [defaultLimit, set],
  );

  return { page, limit, setPage, setLimit };
}
