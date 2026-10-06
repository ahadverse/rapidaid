'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { AmbulanceRecord, AmbulanceStatus, AmbulanceType } from '@/lib/api/types';
import { ambulanceFormSchema, type AmbulanceFormValues } from '@/lib/validation/ambulance';

export async function updateAmbulanceStatusAction(
  id: string,
  status: AmbulanceStatus,
): Promise<ActionResult<{ id: string; status: AmbulanceStatus }>> {
  return authedAction(`/ambulances/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function listAmbulancesPageAction(query: {
  page: number;
  limit: number;
  searchTerm?: string;
  type?: AmbulanceType;
  status?: AmbulanceStatus;
  stationArea?: string;
  sortBy: string;
  sortOrder: string;
}): Promise<ActionResult<AmbulanceRecord[]>> {
  return authedAction<AmbulanceRecord[]>('/ambulances', { query });
}

export async function saveAmbulanceAction(
  id: string | null,
  values: AmbulanceFormValues,
): Promise<ActionResult<AmbulanceRecord>> {
  const parsed = ambulanceFormSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  const { baseFare, perKmRate, ...rest } = parsed.data;

  return authedAction<AmbulanceRecord>(
    id ? `/ambulances/${encodeURIComponent(id)}` : '/ambulances',
    {
      method: id ? 'PATCH' : 'POST',
      body: { ...rest, baseFare: Number(baseFare), perKmRate: Number(perKmRate) },
    },
  );
}

export async function deleteAmbulanceAction(id: string): Promise<ActionResult<AmbulanceRecord>> {
  return authedAction<AmbulanceRecord>(`/ambulances/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
