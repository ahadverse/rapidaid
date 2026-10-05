'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listHospitalsAction } from '@/app/actions/hospitals';
import { selectTripHospitalAction, updateTripStatusAction } from '@/app/actions/trips';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { unwrap } from '@/lib/api/action-result';
import type { Trip } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { HOSPITAL_SELECTABLE, NEXT_ACTION_LABEL, NEXT_TRIP_STATUS } from '@/lib/trip-flow';

type TripActionsProps = {
  trip: Trip;
  onComplete: (trip: Trip) => void;
};

export function TripActions({ trip, onComplete }: TripActionsProps) {
  const queryClient = useQueryClient();
  const next = NEXT_TRIP_STATUS[trip.status];
  const canPickHospital = HOSPITAL_SELECTABLE.includes(trip.status);
  const needsHospital = next === 'EN_ROUTE_TO_HOSPITAL' && !trip.hospital;

  const hospitals = useQuery({
    queryKey: queryKeys.hospitals.list({ picker: true }),
    queryFn: async () => unwrap(await listHospitalsAction()).data,
    staleTime: 5 * 60_000,
    enabled: canPickHospital,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.me() });
  };

  const advance = useMutation({
    mutationFn: async (status: NonNullable<typeof next>) =>
      unwrap(await updateTripStatusAction(trip.id, status)).data,
    onSuccess: refresh,
  });

  const chooseHospital = useMutation({
    mutationFn: async (hospitalId: string) =>
      unwrap(await selectTripHospitalAction(trip.id, hospitalId)).data,
    onSuccess: refresh,
  });

  return (
    <div className="space-y-3">
      {canPickHospital ? (
        <Field>
          <FieldLabel htmlFor={`hospital-${trip.id}`}>Destination hospital</FieldLabel>
          <Select
            value={trip.hospital?.id ?? ''}
            onValueChange={(value) => chooseHospital.mutate(value)}
            disabled={chooseHospital.isPending || hospitals.isPending}
          >
            <SelectTrigger id={`hospital-${trip.id}`} className="w-full">
              <SelectValue placeholder="Select a hospital" />
            </SelectTrigger>
            <SelectContent>
              {(hospitals.data ?? []).map((hospital) => (
                <SelectItem key={hospital.id} value={hospital.id}>
                  {hospital.name} · {hospital.area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {needsHospital ? (
            <FieldDescription>Choose a hospital before heading there.</FieldDescription>
          ) : null}
        </Field>
      ) : null}
      {next ? (
        <Button
          className="w-full"
          disabled={advance.isPending || needsHospital}
          onClick={() => advance.mutate(next)}
        >
          {advance.isPending ? 'Updating...' : (NEXT_ACTION_LABEL[next] ?? 'Next step')}
        </Button>
      ) : null}
      {trip.status === 'ARRIVED_AT_HOSPITAL' ? (
        <Button className="w-full" onClick={() => onComplete(trip)}>
          Complete trip
        </Button>
      ) : null}
    </div>
  );
}
