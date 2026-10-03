import { cookies } from 'next/headers';
import { secondsUntilExpiry } from './token';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

export function sessionCookieEntries(accessToken: string, refreshToken?: string) {
  const entries = [
    {
      name: ACCESS_COOKIE,
      value: accessToken,
      options: { ...baseOptions, maxAge: secondsUntilExpiry(accessToken) },
    },
  ];

  if (refreshToken) {
    entries.push({
      name: REFRESH_COOKIE,
      value: refreshToken,
      options: { ...baseOptions, maxAge: REFRESH_MAX_AGE_SECONDS },
    });
  }

  return entries;
}

export async function setSessionCookies(accessToken: string, refreshToken?: string) {
  const store = await cookies();

  for (const { name, value, options } of sessionCookieEntries(accessToken, refreshToken)) {
    store.set(name, value, options);
  }
}

export async function clearSessionCookies() {
  const store = await cookies();

  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
