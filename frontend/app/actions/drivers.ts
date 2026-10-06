'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { DriverProfile } from '@/lib/api/types';
import { NO_AMBULANCE, driverFormSchema, type DriverFormValues } from '@/lib/validation/driver';

export async function getMyDriverProfileAction(): Promise<ActionResult<DriverProfile>> {
  return authedAction<DriverProfile>('/drivers/me');
}

export async function listDriversAction(): Promise<ActionResult<DriverProfile[]>> {
  return authedAction<DriverProfile[]>('/drivers', { query: { limit: 100 } });
}

export async function updateMyAvailabilityAction(
  isAvailable: boolean,
): Promise<ActionResult<DriverProfile>> {
  return authedAction<DriverProfile>('/drivers/me/availability', {
    method: 'PATCH',
    body: { isAvailable },
  });
}

export async function listDriversPageAction(query: {
  page: number;
  limit: number;
  searchTerm?: string;
  isAvailable?: 'true' | 'false';
  sortBy: string;
  sortOrder: string;
}): Promise<ActionResult<DriverProfile[]>> {
  return authedAction<DriverProfile[]>('/drivers', { query });
}

export async function createDriverAction(
  values: DriverFormValues,
): Promise<ActionResult<DriverProfile>> {
  const parsed = driverFormSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  const { ambulanceId, ...rest } = parsed.data;

  return authedAction<DriverProfile>('/drivers', {
    method: 'POST',
    body: ambulanceId === NO_AMBULANCE ? rest : { ...rest, ambulanceId },
  });
}
