import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HospitalTable } from '@/components/admin/hospital-table';
import { TableSkeleton } from '@/components/shared/table-skeleton';

export const metadata: Metadata = { title: 'Hospitals' };

export default function AdminHospitalsPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={6} rows={6} />}>
      <HospitalTable />
    </Suspense>
  );
}
