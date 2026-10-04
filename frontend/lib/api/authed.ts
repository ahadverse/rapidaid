import { api, type RequestOptions } from './client';
import type { ActionResult } from './action-result';
import { isApiError } from './error';
import { getAccessToken } from '@/lib/auth/session';

// Thrown errors from server actions are redacted in production, so failures travel as values.
export async function authedAction<T>(
  path: string,
  options: Omit<RequestOptions, 'token'> = {},
): Promise<ActionResult<T>> {
  const token = await getAccessToken();

  if (!token) {
    return { ok: false, error: 'Your session has expired. Please sign in again.' };
  }

  try {
    const { data, meta } = await api<T>(path, { ...options, token, cache: 'no-store' });

    return { ok: true, data, meta };
  } catch (error) {
    if (isApiError(error)) {
      return {
        ok: false,
        error: error.message,
        status: error.statusCode,
        fieldErrors: error.fieldErrors(),
      };
    }

    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}
