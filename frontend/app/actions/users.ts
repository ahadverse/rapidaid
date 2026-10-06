'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { Role, UserProfile, UserStatus } from '@/lib/api/types';
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

export async function listUsersAction(query: {
  page: number;
  limit: number;
  searchTerm?: string;
  role?: Role;
  status?: UserStatus;
  sortBy: string;
  sortOrder: string;
}): Promise<ActionResult<UserProfile[]>> {
  return authedAction<UserProfile[]>('/users', { query });
}

export async function updateUserStatusAction(
  id: string,
  status: UserStatus,
): Promise<ActionResult<UserProfile>> {
  return authedAction<UserProfile>(`/users/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  return authedAction<void>(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
