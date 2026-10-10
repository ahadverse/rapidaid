import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TransactionTable } from '@/components/admin/transaction-table';
import { TableSkeleton } from '@/components/shared/table-skeleton';

export const metadata: Metadata = { title: 'Transactions' };

export default function AdminTransactionsPage() {
  return (
    <Suspense fallback={<TableSkeleton columns={7} rows={6} />}>
      <TransactionTable />
    </Suspense>
  );
}
