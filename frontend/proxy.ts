import { NextResponse, type NextRequest } from 'next/server';
import { ROLES, type Role } from '@/lib/api/types';
import { authRequest } from '@/lib/auth/backend';
import { ACCESS_COOKIE, REFRESH_COOKIE, sessionCookieEntries } from '@/lib/auth/cookies';
import { decodeAccessToken } from '@/lib/auth/token';
import { roleHome } from '@/lib/navigation';

const guardedPrefixes: { prefix: string; roles: readonly Role[] }[] = [
  { prefix: '/admin', roles: ['ADMIN'] },
  { prefix: '/dashboard', roles: ['PATIENT'] },
  { prefix: '/driver', roles: ['DRIVER'] },
  { prefix: '/payment', roles: ['PATIENT'] },
  { prefix: '/trips', roles: ROLES },
];

const guestOnlyPaths = ['/login', '/register'];

const matchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

async function rotateTokens(refreshToken: string) {
  try {
    const { data, refreshToken: rotated } = await authRequest<{ accessToken: string }>(
      '/auth/refresh-token',
      { refreshToken },
    );

    return { accessToken: data.accessToken, refreshToken: rotated };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const guard = guardedPrefixes.find(({ prefix }) => matchesPrefix(pathname, prefix));
  const guestOnly = guestOnlyPaths.includes(pathname);

  if (!guard && !guestOnly) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  let session = accessToken ? decodeAccessToken(accessToken) : null;
  let rotated: { accessToken: string; refreshToken?: string } | null = null;

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!session && refreshToken) {
    rotated = await rotateTokens(refreshToken);
    session = rotated ? decodeAccessToken(rotated.accessToken) : null;
  }

  let response: NextResponse;

  if (!session) {
    response = guard ? NextResponse.redirect(new URL('/login', request.url)) : NextResponse.next();
  } else if (guestOnly) {
    response = NextResponse.redirect(new URL(roleHome[session.role], request.url));
  } else if (guard && !guard.roles.includes(session.role)) {
    response = NextResponse.redirect(new URL(roleHome[session.role], request.url));
  } else {
    response = NextResponse.next();
  }

  if (rotated) {
    for (const { name, value, options } of sessionCookieEntries(
      rotated.accessToken,
      rotated.refreshToken,
    )) {
      response.cookies.set(name, value, options);
    }
  } else if (!session && refreshToken) {
    response.cookies.delete(REFRESH_COOKIE);
    response.cookies.delete(ACCESS_COOKIE);
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/driver/:path*',
    '/payment/:path*',
    '/trips/:path*',
    '/login',
    '/register',
  ],
};
