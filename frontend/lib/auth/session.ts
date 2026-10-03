import { cookies } from 'next/headers';
import type { SessionUser } from '@/hooks/use-auth';
import { ROLES } from '@/lib/api/types';
import { ACCESS_COOKIE } from './cookies';

type AccessPayload = {
  userId: string;
  email: string;
  role: SessionUser['role'];
  exp?: number;
};

export function decodeAccessToken(token: string): AccessPayload | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString(),
    ) as AccessPayload;

    const expired = payload.exp !== undefined && payload.exp * 1000 <= Date.now();

    return expired || !ROLES.includes(payload.role) ? null : payload;
  } catch {
    return null;
  }
}

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
