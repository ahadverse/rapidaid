import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function DriverLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="DRIVER">{children}</DashboardShell>;
}
