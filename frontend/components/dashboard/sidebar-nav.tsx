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
    <nav className="flex flex-col gap-5" aria-label="Dashboard">
      {dashboardNav[role].map((group, index) => (
        <div key={group.label ?? index} className="flex flex-col gap-1">
          {group.label ? (
            <p className="px-3 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {group.label}
            </p>
          ) : null}
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = href === home ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  active &&
                    'bg-primary/10 text-primary before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary hover:bg-primary/10 hover:text-primary',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
