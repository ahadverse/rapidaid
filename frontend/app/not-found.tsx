import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth/session';
import { roleHome } from '@/lib/navigation';

export default async function NotFound() {
  const session = await getSession();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 items-center justify-center px-4 py-16"
    >
      <EmptyState
        className="w-full max-w-md"
        icon={SearchX}
        title="Page not found"
        message="The page you are looking for does not exist or has moved."
        action={
          <Button asChild>
            <Link href={session ? roleHome[session.role] : '/'}>
              {session ? 'Back to dashboard' : 'Back to home'}
            </Link>
          </Button>
        }
      />
    </main>
  );
}
