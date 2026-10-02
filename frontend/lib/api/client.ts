import { env } from '../env';
import { ApiError } from './error';
import type { ApiFailure, ApiResult, ApiSuccess } from './types';

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  query?: Record<string, QueryValue>;
  token?: string;
};

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${env.apiUrl}${path.startsWith('/') ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseBody(response: Response): Promise<ApiSuccess<unknown> | ApiFailure | null> {
  try {
    return (await response.json()) as ApiSuccess<unknown> | ApiFailure;
  } catch {
    return null;
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { body, query, token, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      credentials: 'include',
      ...init,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }

  const payload = await parseBody(response);

  if (!response.ok || payload?.success === false) {
    const failure = payload as ApiFailure | null;
    throw new ApiError(
      failure?.statusCode ?? response.status,
      failure?.message ?? 'Something went wrong',
      failure?.errors,
    );
  }

  const success = payload as ApiSuccess<T> | null;

  return {
    data: success?.data as T,
    meta: success?.meta,
    message: success?.message ?? '',
  };
}
