'use client';

import { useAuth } from '@/hooks/use-auth';
import { roleLabel } from '@/lib/dashboard-nav';

export function SidebarAccount() {
  const { user, role } = useAuth();

  if (!user?.email || !role) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {(user.email[0] ?? role[0]).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{user.email}</p>
        <p className="text-xs text-muted-foreground">{roleLabel[role]}</p>
      </div>
    </div>
  );
}
