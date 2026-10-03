'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { publicNavLinks } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function NavbarLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
      {publicNavLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? 'page' : undefined}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
            pathname === href && 'text-primary',
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
