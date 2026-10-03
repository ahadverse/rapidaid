import { cookies } from 'next/headers';
import type { SessionUser } from '@/hooks/use-auth';
import { ACCESS_COOKIE } from './cookies';
import { decodeAccessToken } from './token';

// Decoding only: the backend verifies the signature on every API call, and the frontend
// holds no signing secret.
export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeAccessToken(token) : null;

  return payload ? { id: payload.userId, email: payload.email, role: payload.role } : null;
}

export async function getAccessToken(): Promise<string | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;

  return token && decodeAccessToken(token) ? token : null;
}
