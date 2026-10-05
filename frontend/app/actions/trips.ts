'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { Trip, TripStatus } from '@/lib/api/types';

export async function listMyTripsAction(query: {
  page?: number;
  limit: number;
  status?: TripStatus;
}): Promise<ActionResult<Trip[]>> {
  return authedAction<Trip[]>('/trips/me', {
    query: { ...query, sortBy: 'createdAt', sortOrder: 'desc' },
  });
}

export async function getTripAction(id: string): Promise<ActionResult<Trip>> {
  return authedAction<Trip>(`/trips/${encodeURIComponent(id)}`);
}
