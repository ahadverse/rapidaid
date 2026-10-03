import { cookies } from 'next/headers';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

function secondsUntilExpiry(token: string): number {
  try {
    const { exp } = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as {
      exp?: number;
    };

    return exp ? Math.max(exp - Math.floor(Date.now() / 1000), 0) : 0;
  } catch {
    return 0;
  }
}

export async function setSessionCookies(accessToken: string, refreshToken?: string) {
  const store = await cookies();

  store.set(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: secondsUntilExpiry(accessToken),
  });

  if (refreshToken) {
    store.set(REFRESH_COOKIE, refreshToken, { ...baseOptions, maxAge: REFRESH_MAX_AGE_SECONDS });
  }
}

export async function clearSessionCookies() {
  const store = await cookies();

  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
