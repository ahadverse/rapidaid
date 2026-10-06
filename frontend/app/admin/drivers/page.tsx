import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DriverTable } from '@/components/admin/driver-table';
import { TableSkeleton } from '@/components/shared/table-skeleton';

export const metadata: Metadata = { title: 'Drivers' };

export default function AdminDriversPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={6} rows={6} />}>
      <DriverTable />
    </Suspense>
  );
}
