'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { Trip } from '@/lib/api/types';

export async function listMyTripsAction(query: {
  page?: number;
  limit: number;
}): Promise<ActionResult<Trip[]>> {
  return authedAction<Trip[]>('/trips/me', {
    query: { ...query, sortBy: 'createdAt', sortOrder: 'desc' },
  });
}
