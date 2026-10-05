'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeAction } from '@/app/actions/users';
import { PasswordForm } from '@/components/profile/password-form';
import { ProfileForm } from '@/components/profile/profile-form';
import { CardSkeleton } from '@/components/shared/card-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { unwrap } from '@/lib/api/action-result';
import { queryKeys } from '@/lib/query/keys';

export function ProfileSettings() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: async () => unwrap(await getMeAction()).data,
    meta: { silent: true },
  });

  if (isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <ProfileForm profile={data} />
      <PasswordForm />
    </div>
  );
}
