import { ROLES, type Role } from '@/lib/api/types';

export type AccessPayload = {
  userId: string;
  email: string;
  role: Role;
  exp?: number;
};

function readPayload(token: string): AccessPayload | null {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as AccessPayload;
  } catch {
    return null;
  }
}

export function decodeAccessToken(token: string): AccessPayload | null {
  const payload = readPayload(token);

  if (!payload || !ROLES.includes(payload.role)) {
    return null;
  }

  return payload.exp !== undefined && payload.exp * 1000 <= Date.now() ? null : payload;
}

export function secondsUntilExpiry(token: string): number {
  const exp = readPayload(token)?.exp;

  return exp ? Math.max(exp - Math.floor(Date.now() / 1000), 0) : 0;
}
