import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/components/providers/query-provider';
import type { Role } from '@/lib/api/types';
import { AuthProvider } from '@/hooks/use-auth';
import { getSession } from '@/lib/auth/session';
import { roleHome } from '@/lib/navigation';
import { Brand } from './brand';
import { MobileSidebar } from './mobile-sidebar';
import { NotificationBell } from './notification-bell';
import { SidebarNav } from './sidebar-nav';
import { UserMenu } from './user-menu';

type DashboardShellProps = {
  role?: Role;
  children: ReactNode;
};

// proxy.ts already redirects wrong-role visits; this re-check keeps the shell safe if the
// matcher ever changes.
export async function DashboardShell({ role, children }: DashboardShellProps) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (role && session.role !== role) {
    redirect(roleHome[session.role]);
  }

  const home = roleHome[session.role];

  return (
    <AuthProvider user={session}>
      <QueryProvider>
        <div className="flex min-h-screen">
          <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r bg-background p-4 lg:flex">
            <Brand href={home} />
            <SidebarNav />
          </aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
              <div className="flex items-center gap-2">
                <MobileSidebar />
                <div className="lg:hidden">
                  <Brand href={home} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <NotificationBell />
                <UserMenu />
              </div>
            </header>
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </QueryProvider>
    </AuthProvider>
  );
}
