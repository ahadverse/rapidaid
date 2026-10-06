'use client';

import { useCallback } from 'react';
import type { SortOrder } from '@/components/shared/data-table';
import { useUrlQuery } from './use-url-query';

export function useUrlSort(defaultSortBy: string, defaultOrder: SortOrder = 'desc') {
  const { get, set } = useUrlQuery();
  const rawOrder = get('sortOrder');

  const sortBy = get('sortBy') || defaultSortBy;
  const sortOrder: SortOrder = rawOrder === 'asc' || rawOrder === 'desc' ? rawOrder : defaultOrder;

  const setSort = useCallback(
    (nextBy: string, nextOrder: SortOrder) => set({ sortBy: nextBy, sortOrder: nextOrder }),
    [set],
  );

  return { sortBy, sortOrder, setSort };
}
