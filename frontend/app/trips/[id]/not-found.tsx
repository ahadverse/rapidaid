import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth/session';
import { roleHome } from '@/lib/navigation';

export default async function TripNotFound() {
  const session = await getSession();

  return (
    <EmptyState
      icon={SearchX}
      title="Trip not found"
      message="This trip does not exist, or it belongs to another account."
      action={
        <Button asChild>
          <Link href={session ? roleHome[session.role] : '/login'}>Back to dashboard</Link>
        </Button>
      }
    />
  );
}
