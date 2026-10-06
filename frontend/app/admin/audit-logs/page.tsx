import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuditLogTable } from '@/components/admin/audit-log-table';
import { TableSkeleton } from '@/components/shared/table-skeleton';

export const metadata: Metadata = { title: 'Audit logs' };

export default function AdminAuditLogsPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={5} rows={6} />}>
      <AuditLogTable />
    </Suspense>
  );
}
