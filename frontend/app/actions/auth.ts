'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isApiError } from '@/lib/api/error';
import type { Role } from '@/lib/api/types';
import { authRequest } from '@/lib/auth/backend';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearSessionCookies,
  setSessionCookies,
} from '@/lib/auth/cookies';
import { roleHome } from '@/lib/navigation';
import { loginSchema, type LoginValues } from '@/lib/validation/auth';

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type LoginData = { accessToken: string; user: { role: Role } };

export async function loginAction(values: LoginValues): Promise<ActionState> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid credentials' };
  }

  let role: Role;

  try {
    const { data, refreshToken } = await authRequest<LoginData>('/auth/login', {
      body: parsed.data,
    });

    await setSessionCookies(data.accessToken, refreshToken);
    role = data.user.role;
  } catch (error) {
    if (isApiError(error)) {
      return { error: error.message, fieldErrors: error.fieldErrors() };
    }

    return { error: 'Something went wrong. Please try again.' };
  }

  redirect(roleHome[role]);
}

export async function refreshSessionAction(): Promise<boolean> {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return false;
  }

  try {
    const { data, refreshToken: rotated } = await authRequest<{ accessToken: string }>(
      '/auth/refresh-token',
      { refreshToken },
    );

    await setSessionCookies(data.accessToken, rotated);

    return true;
  } catch {
    await clearSessionCookies();

    return false;
  }
}

export async function logoutAction(): Promise<void> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;

  // A failed API call must not leave the user signed in locally.
  await authRequest('/auth/logout', { accessToken }).catch(() => null);
  await clearSessionCookies();

  redirect('/login');
}
