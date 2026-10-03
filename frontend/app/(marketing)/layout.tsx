import type { ReactNode } from 'react';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicNavbar } from '@/components/layout/public-navbar';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <div className="flex flex-1 flex-col">{children}</div>
      <PublicFooter />
    </>
  );
}
