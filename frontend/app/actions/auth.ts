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
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from '@/lib/validation/auth';

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type LoginData = { accessToken: string; user: { role: Role } };

async function startSession(credentials: LoginValues): Promise<Role> {
  const { data, refreshToken } = await authRequest<LoginData>('/auth/login', {
    body: credentials,
  });

  await setSessionCookies(data.accessToken, refreshToken);

  return data.user.role;
}

function toActionState(error: unknown): ActionState {
  if (isApiError(error)) {
    return { error: error.message, fieldErrors: error.fieldErrors() };
  }

  return { error: 'Something went wrong. Please try again.' };
}

export async function loginAction(values: LoginValues): Promise<ActionState> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid credentials' };
  }

  let role: Role;

  try {
    role = await startSession(parsed.data);
  } catch (error) {
    return toActionState(error);
  }

  redirect(roleHome[role]);
}

export async function registerAction(values: RegisterValues): Promise<ActionState> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Please check the form' };
  }

  try {
    await authRequest('/auth/register', { body: parsed.data });
    await startSession({ email: parsed.data.email, password: parsed.data.password });
  } catch (error) {
    return toActionState(error);
  }

  redirect(roleHome.PATIENT);
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
