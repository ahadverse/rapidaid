'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { EmergencyRequest } from '@/lib/api/types';
import {
  cancelRequestSchema,
  createRequestSchema,
  updateRequestSchema,
  type CancelRequestValues,
  type CreateRequestValues,
  type UpdateRequestValues,
} from '@/lib/validation/emergency-request';

export async function listMyRequestsAction(query: {
  page: number;
  limit: number;
}): Promise<ActionResult<EmergencyRequest[]>> {
  return authedAction<EmergencyRequest[]>('/emergency-requests', {
    query: { ...query, sortBy: 'createdAt', sortOrder: 'desc' },
  });
}

export async function createRequestAction(
  values: CreateRequestValues,
): Promise<ActionResult<EmergencyRequest>> {
  const parsed = createRequestSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  const { requestedAmbulanceType, ...rest } = parsed.data;

  return authedAction<EmergencyRequest>('/emergency-requests', {
    method: 'POST',
    body: requestedAmbulanceType ? { ...rest, requestedAmbulanceType } : rest,
  });
}

export async function updateRequestAction(
  id: string,
  values: UpdateRequestValues,
): Promise<ActionResult<EmergencyRequest>> {
  const parsed = updateRequestSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  const { requestedAmbulanceType, ...rest } = parsed.data;

  return authedAction<EmergencyRequest>(`/emergency-requests/${id}`, {
    method: 'PATCH',
    body: requestedAmbulanceType ? { ...rest, requestedAmbulanceType } : rest,
  });
}

export async function cancelRequestAction(
  id: string,
  values: CancelRequestValues,
): Promise<ActionResult<EmergencyRequest>> {
  const parsed = cancelRequestSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  return authedAction<EmergencyRequest>(`/emergency-requests/${id}/cancel`, {
    method: 'PATCH',
    body: parsed.data,
  });
}
