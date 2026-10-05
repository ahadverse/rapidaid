'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getMyDriverProfileAction, updateMyAvailabilityAction } from '@/app/actions/drivers';
import { ErrorState } from '@/components/shared/error-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { unwrap } from '@/lib/api/action-result';
import type { DriverProfile } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';

export function AvailabilityToggle() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.drivers.me(),
    queryFn: async () => unwrap(await getMyDriverProfileAction()).data,
    meta: { silent: true },
  });

  const toggle = useMutation({
    mutationFn: async (isAvailable: boolean) =>
      unwrap(await updateMyAvailabilityAction(isAvailable)).data,
    onMutate: async (isAvailable) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.drivers.me() });
      const previous = queryClient.getQueryData<DriverProfile>(queryKeys.drivers.me());

      queryClient.setQueryData<DriverProfile>(queryKeys.drivers.me(), (current) =>
        current ? { ...current, isAvailable } : current,
      );

      return { previous };
    },
    onError: (_error, _isAvailable, context) => {
      queryClient.setQueryData(queryKeys.drivers.me(), context?.previous);
    },
    onSuccess: (saved) => {
      toast.success(saved.isAvailable ? 'You are available for dispatch' : 'You are offline');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.drivers.me() }),
  });

  if (isPending) {
    return <Skeleton className="h-28 w-full rounded-xl" />;
  }

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>
          {profile.ambulance
            ? `Assigned to ${profile.ambulance.regNumber}. Switch off to stop receiving dispatches.`
            : 'You need an assigned ambulance before you can go available.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Switch
          id="availability"
          checked={profile.isAvailable}
          onCheckedChange={(checked) => toggle.mutate(checked)}
          aria-label="Available for dispatch"
        />
        <label htmlFor="availability" className="text-sm font-medium">
          {profile.isAvailable ? 'Available for dispatch' : 'Offline'}
        </label>
      </CardContent>
    </Card>
  );
}
