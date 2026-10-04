import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function PatientLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="PATIENT">{children}</DashboardShell>;
}
