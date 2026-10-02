'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Role } from '@/lib/api/types';

export type SessionUser = {
  id: string;
  role: Role;
  name?: string;
  email?: string;
};

type AuthContextValue = {
  user: SessionUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  hasRole: (...roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  user: SessionUser | null;
  children: ReactNode;
};

// The access token lives in an httpOnly cookie, so the client cannot read it; the server
// resolves the session and hands the user down through this provider.
export function AuthProvider({ user, children }: AuthProviderProps) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: user !== null,
      hasRole: (...roles) => user !== null && roles.includes(user.role),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
