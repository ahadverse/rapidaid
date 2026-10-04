'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dashboardNav } from '@/lib/dashboard-nav';
import { roleHome } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

type SidebarNavProps = {
  onNavigate?: () => void;
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { role } = useAuth();
  const pathname = usePathname();

  if (!role) {
    return null;
  }

  const home = roleHome[role];

  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {dashboardNav[role].map(({ href, label, icon: Icon }) => {
        const active = href === home ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
              active && 'bg-primary/10 text-primary hover:bg-primary/10',
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
