import type { Metadata } from 'next';
import { Suspense } from 'react';
import { UserTable } from '@/components/admin/user-table';
import { TableSkeleton } from '@/components/shared/table-skeleton';

export const metadata: Metadata = { title: 'Users' };

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={6} rows={6} />}>
      <UserTable />
    </Suspense>
  );
}
