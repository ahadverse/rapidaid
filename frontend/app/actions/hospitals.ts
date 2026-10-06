'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { Hospital } from '@/lib/api/types';
import {
  hospitalFormSchema,
  parseSpecializations,
  type HospitalFormValues,
} from '@/lib/validation/hospital';

export async function listHospitalsAction(): Promise<ActionResult<Hospital[]>> {
  return authedAction<Hospital[]>('/hospitals', {
    query: { limit: 100, sortBy: 'name', sortOrder: 'asc' },
  });
}

export async function listHospitalsPageAction(query: {
  page: number;
  limit: number;
  searchTerm?: string;
  sortBy: string;
  sortOrder: string;
}): Promise<ActionResult<Hospital[]>> {
  return authedAction<Hospital[]>('/hospitals', { query });
}

function toPayload(values: HospitalFormValues) {
  const { availableBeds, specializations, ...rest } = values;

  return {
    ...rest,
    specializations: parseSpecializations(specializations),
    ...(availableBeds === '' ? {} : { availableBeds: Number(availableBeds) }),
  };
}

export async function saveHospitalAction(
  id: string | null,
  values: HospitalFormValues,
): Promise<ActionResult<Hospital>> {
  const parsed = hospitalFormSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  return authedAction<Hospital>(id ? `/hospitals/${encodeURIComponent(id)}` : '/hospitals', {
    method: id ? 'PATCH' : 'POST',
    body: toPayload(parsed.data),
  });
}

export async function deleteHospitalAction(id: string): Promise<ActionResult<Hospital>> {
  return authedAction<Hospital>(`/hospitals/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
