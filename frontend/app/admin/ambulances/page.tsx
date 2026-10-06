import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AmbulanceTable } from '@/components/admin/ambulance-table';
import { TableSkeleton } from '@/components/shared/table-skeleton';

export const metadata: Metadata = { title: 'Ambulances' };

export default function AdminAmbulancesPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={7} rows={6} />}>
      <AmbulanceTable />
    </Suspense>
  );
}
