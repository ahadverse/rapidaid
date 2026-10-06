import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReportsView } from '@/components/admin/reports-view';
import { CardSkeleton } from '@/components/shared/card-skeleton';

export const metadata: Metadata = { title: 'Reports' };

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<CardSkeleton lines={8} />}>
      <ReportsView />
    </Suspense>
  );
}
