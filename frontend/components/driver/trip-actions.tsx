'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, Flag, Hospital, Navigation, UserCheck, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { listHospitalsAction } from '@/app/actions/hospitals';
import { selectTripHospitalAction, updateTripStatusAction } from '@/app/actions/trips';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { unwrap } from '@/lib/api/action-result';
import type { Trip, TripStatus } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { HOSPITAL_SELECTABLE, NEXT_ACTION, NEXT_TRIP_STATUS } from '@/lib/trip-flow';
import { tripHospitalSchema, type TripHospitalValues } from '@/lib/validation/trip';

const ACTION_ICONS: Partial<Record<TripStatus, LucideIcon>> = {
  EN_ROUTE_TO_PICKUP: Navigation,
  PATIENT_PICKED_UP: UserCheck,
  EN_ROUTE_TO_HOSPITAL: Hospital,
  ARRIVED_AT_HOSPITAL: Flag,
};

type TripActionsProps = {
  trip: Trip;
  onComplete: (trip: Trip) => void;
};

export function TripActions({ trip, onComplete }: TripActionsProps) {
  const queryClient = useQueryClient();
  const [pendingHospitalId, setPendingHospitalId] = useState<string | null>(null);
  const next = NEXT_TRIP_STATUS[trip.status];
  const action = next ? NEXT_ACTION[next] : undefined;
  const ActionIcon = next ? ACTION_ICONS[next] : undefined;
  const canPickHospital = HOSPITAL_SELECTABLE.includes(trip.status);

  const { control, handleSubmit } = useForm<TripHospitalValues>({
    resolver: zodResolver(tripHospitalSchema),
    defaultValues: { hospitalId: trip.hospital?.id ?? '' },
    mode: 'onChange',
  });

  const hospitals = useQuery({
    queryKey: queryKeys.hospitals.list({ picker: true }),
    queryFn: async () => unwrap(await listHospitalsAction()).data,
    staleTime: 5 * 60_000,
    enabled: canPickHospital,
  });

  const advance = useMutation({
    mutationFn: async ({ status, hospitalId }: { status: TripStatus; hospitalId: string }) => {
      if (hospitalId !== trip.hospital?.id) {
        unwrap(await selectTripHospitalAction(trip.id, hospitalId));
      }

      return unwrap(await updateTripStatusAction(trip.id, status)).data;
    },
    onSuccess: () => {
      toast.success('Trip status updated');
      setPendingHospitalId(null);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.me() });
    },
  });

  return (
    <div className="space-y-3">
      {next && action && canPickHospital ? (
        <>
          <form
            onSubmit={handleSubmit(({ hospitalId }) => setPendingHospitalId(hospitalId))}
            noValidate
            className="space-y-3"
          >
            <Controller
              name="hospitalId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`hospital-${trip.id}`}>Destination hospital</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={advance.isPending || hospitals.isPending}
                  >
                    <SelectTrigger
                      id={`hospital-${trip.id}`}
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
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
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Button type="submit" className="w-full" disabled={advance.isPending}>
              {ActionIcon ? <ActionIcon aria-hidden="true" /> : null}
              {action.label}
            </Button>
          </form>
          <ConfirmDialog
            open={pendingHospitalId !== null}
            title={`${action.label}?`}
            description={`${action.description} This step cannot be undone.`}
            confirmLabel={action.label}
            cancelLabel="Not yet"
            confirmVariant="default"
            pending={advance.isPending}
            onConfirm={() =>
              pendingHospitalId && advance.mutate({ status: next, hospitalId: pendingHospitalId })
            }
            onClose={() => setPendingHospitalId(null)}
          />
        </>
      ) : null}
      {trip.status === 'ARRIVED_AT_HOSPITAL' ? (
        <Button className="w-full" onClick={() => onComplete(trip)}>
          <CircleCheck aria-hidden="true" />
          Complete trip
        </Button>
      ) : null}
    </div>
  );
}
