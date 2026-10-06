import type { Metadata } from 'next';
import { DispatchConsole } from '@/components/admin/dispatch-console';

export const metadata: Metadata = { title: 'Dispatch' };

export default function AdminDispatchPage() {
  return <DispatchConsole />;
}
