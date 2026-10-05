'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { Trip, TripStatus } from '@/lib/api/types';
import { completeTripSchema, type CompleteTripValues } from '@/lib/validation/trip';

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

export async function updateTripStatusAction(
  id: string,
  status: TripStatus,
): Promise<ActionResult<Trip>> {
  return authedAction<Trip>(`/trips/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function selectTripHospitalAction(
  id: string,
  hospitalId: string,
): Promise<ActionResult<Trip>> {
  return authedAction<Trip>(`/trips/${encodeURIComponent(id)}/hospital`, {
    method: 'PATCH',
    body: { hospitalId },
  });
}

export async function completeTripAction(
  id: string,
  values: CompleteTripValues,
): Promise<ActionResult<Trip>> {
  const parsed = completeTripSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  return authedAction<Trip>(`/trips/${encodeURIComponent(id)}/complete`, {
    method: 'PATCH',
    body: { distanceKm: Number(parsed.data.distanceKm) },
  });
}
