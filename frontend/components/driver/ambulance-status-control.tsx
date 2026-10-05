'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ambulance } from 'lucide-react';
import { toast } from 'sonner';
import { updateAmbulanceStatusAction } from '@/app/actions/ambulances';
import { getMyDriverProfileAction } from '@/app/actions/drivers';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { unwrap } from '@/lib/api/action-result';
import type { AmbulanceStatus } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';

const MANUAL_STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
] as const;

export function AmbulanceStatusControl() {
  const queryClient = useQueryClient();

  const { data: profile, isPending } = useQuery({
    queryKey: queryKeys.drivers.me(),
    queryFn: async () => unwrap(await getMyDriverProfileAction()).data,
    meta: { silent: true },
  });

  const update = useMutation({
    mutationFn: async (status: AmbulanceStatus) =>
      profile?.ambulance
        ? unwrap(await updateAmbulanceStatusAction(profile.ambulance.id, status))
        : null,
    onSuccess: () => {
      toast.success('Ambulance status updated');
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.me() });
    },
  });

  if (isPending) {
    return <Skeleton className="h-32 w-full rounded-xl" />;
  }

  const ambulance = profile?.ambulance;

  if (!ambulance) {
    return null;
  }

  const onTrip = ambulance.status === 'ON_TRIP';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Ambulance className="size-4" aria-hidden="true" />
          {ambulance.regNumber}
        </CardTitle>
        <StatusBadge value={ambulance.status} />
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel htmlFor="ambulance-status">Vehicle status</FieldLabel>
          <Select
            value={onTrip ? '' : ambulance.status}
            onValueChange={(value) => update.mutate(value as AmbulanceStatus)}
            disabled={onTrip || update.isPending}
          >
            <SelectTrigger id="ambulance-status" className="w-full sm:max-w-xs">
              <SelectValue placeholder="On an active trip" />
            </SelectTrigger>
            <SelectContent>
              {MANUAL_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            {onTrip
              ? 'Locked while a trip is active.'
              : 'Mark the vehicle as under maintenance to stop receiving dispatches.'}
          </FieldDescription>
        </Field>
      </CardContent>
    </Card>
  );
}
