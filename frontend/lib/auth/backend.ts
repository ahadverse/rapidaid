import { ApiError } from '@/lib/api/error';
import type { ApiFailure, ApiSuccess } from '@/lib/api/types';
import { env } from '@/lib/env';

const BACKEND_REFRESH_COOKIE = 'refreshToken';

type AuthRequest = {
  body?: unknown;
  accessToken?: string;
  refreshToken?: string;
};

// The browser never talks to the API for auth, so the backend's Set-Cookie lands on this
// server's fetch and has to be read from the raw response and re-issued as our own cookie.
export async function authRequest<T>(
  path: string,
  { body, accessToken, refreshToken }: AuthRequest = {},
): Promise<{ data: T; refreshToken?: string }> {
  const headers = new Headers({ 'Content-Type': 'application/json' });

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (refreshToken) {
    headers.set('Cookie', `${BACKEND_REFRESH_COOKIE}=${refreshToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method: 'POST',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;

  if (!response.ok || !payload || payload.success === false) {
    const failure = payload as ApiFailure | null;
    throw new ApiError(
      failure?.statusCode ?? response.status,
      failure?.message ?? 'Something went wrong',
      failure?.errors,
    );
  }

  const setCookie = response.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith(`${BACKEND_REFRESH_COOKIE}=`));

  return {
    data: payload.data,
    refreshToken: setCookie?.split(';')[0].slice(BACKEND_REFRESH_COOKIE.length + 1),
  };
}
