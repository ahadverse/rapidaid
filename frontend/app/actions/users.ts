'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { UserProfile } from '@/lib/api/types';
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordValues,
  type ProfileValues,
} from '@/lib/validation/profile';

export async function getMeAction(): Promise<ActionResult<UserProfile>> {
  return authedAction<UserProfile>('/users/me');
}

export async function updateMeAction(values: ProfileValues): Promise<ActionResult<UserProfile>> {
  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  return authedAction<UserProfile>('/users/me', { method: 'PATCH', body: parsed.data });
}

export async function changePasswordAction(values: ChangePasswordValues): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(values);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  const { oldPassword, newPassword } = parsed.data;

  return authedAction<void>('/auth/change-password', {
    method: 'POST',
    body: { oldPassword, newPassword },
  });
}
