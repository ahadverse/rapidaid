'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { AmbulanceStatus } from '@/lib/api/types';

export async function updateAmbulanceStatusAction(
  id: string,
  status: AmbulanceStatus,
): Promise<ActionResult<{ id: string; status: AmbulanceStatus }>> {
  return authedAction(`/ambulances/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  });
}
