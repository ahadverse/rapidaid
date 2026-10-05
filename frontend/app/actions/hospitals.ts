'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { Hospital } from '@/lib/api/types';

export async function listHospitalsAction(): Promise<ActionResult<Hospital[]>> {
  return authedAction<Hospital[]>('/hospitals', {
    query: { limit: 100, sortBy: 'name', sortOrder: 'asc' },
  });
}
