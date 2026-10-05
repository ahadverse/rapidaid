'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { DriverProfile } from '@/lib/api/types';

export async function getMyDriverProfileAction(): Promise<ActionResult<DriverProfile>> {
  return authedAction<DriverProfile>('/drivers/me');
}

export async function updateMyAvailabilityAction(
  isAvailable: boolean,
): Promise<ActionResult<DriverProfile>> {
  return authedAction<DriverProfile>('/drivers/me/availability', {
    method: 'PATCH',
    body: { isAvailable },
  });
}
