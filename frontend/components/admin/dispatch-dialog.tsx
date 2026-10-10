'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { listDriversPageAction } from '@/app/actions/drivers';
import { dispatchRequestAction } from '@/app/actions/emergency-requests';
import { formatStatus } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { unwrap } from '@/lib/api/action-result';
import type { DriverProfile, QueuedRequest, Trip } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { AUTO_ASSIGN, dispatchSchema, type DispatchValues } from '@/lib/validation/dispatch';

type Crew = {
  ambulance: NonNullable<DriverProfile['ambulance']>;
  driverName: string;
};

const DEFAULT_VALUES: DispatchValues = { ambulanceId: AUTO_ASSIGN };

const toCrews = (drivers: DriverProfile[]): Crew[] =>
  drivers.flatMap(({ ambulance, user }) =>
    ambulance && ambulance.status === 'AVAILABLE' && user.status === 'ACTIVE'
      ? [{ ambulance, driverName: user.name }]
      : [],
  );

type DispatchDialogProps = {
  request: QueuedRequest | null;
  onClose: () => void;
  onDispatched: (trip: Trip) => void;
};

export function DispatchDialog({ request, onClose, onDispatched }: DispatchDialogProps) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm<DispatchValues>({
    resolver: zodResolver(dispatchSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });
  const selectedId = useWatch({ control, name: 'ambulanceId' });

  const crews = useQuery({
    queryKey: queryKeys.drivers.list({ dispatch: true }),
    queryFn: async () =>
      toCrews(
        unwrap(
          await listDriversPageAction({
            page: 1,
            limit: 100,
            isAvailable: 'true',
            sortBy: 'createdAt',
            sortOrder: 'asc',
          }),
        ).data,
      ),
    meta: { silent: true },
    enabled: request !== null,
  });

  function close() {
    reset(DEFAULT_VALUES);
    onClose();
  }

  const dispatch = useMutation({
    mutationFn: async (values: DispatchValues) =>
      request ? unwrap(await dispatchRequestAction(request.id, values)).data : null,
    onSuccess: (trip) => {
      toast.success('Ambulance dispatched');
      close();

      if (trip) {
        onDispatched(trip);
      }
    },
    // A 409 means the queue on screen is stale, so it is reloaded either way.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.emergencyRequests.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
    },
  });

  const requestedType = request?.requestedAmbulanceType ?? null;
  const options = [...(crews.data ?? [])].sort(
    (a, b) =>
      Number(b.ambulance.type === requestedType) - Number(a.ambulance.type === requestedType),
  );
  const selected = options.find((crew) => crew.ambulance.id === selectedId);

  function hint() {
    if (crews.isPending) {
      return 'Loading available ambulances...';
    }

    if (crews.isError) {
      return 'Could not load ambulances. Auto-assign still works.';
    }

    if (options.length === 0) {
      return 'No ambulance has an available driver right now.';
    }

    if (selected && requestedType && selected.ambulance.type !== requestedType) {
      return `The patient asked for ${formatStatus(requestedType)}.`;
    }

    return 'Auto-assign prefers the requested ambulance type.';
  }

  return (
    <Dialog open={request !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <form onSubmit={handleSubmit((values) => dispatch.mutate(values))} noValidate>
          <DialogHeader>
            <DialogTitle>Dispatch ambulance</DialogTitle>
            <DialogDescription>
              {request
                ? `Choose a crew for ${request.patient.name} at ${request.pickupAddress}.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Controller
              name="ambulanceId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="dispatch-ambulance">Ambulance</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="dispatch-ambulance"
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AUTO_ASSIGN}>Auto-assign best match</SelectItem>
                      {options.map(({ ambulance, driverName }) => (
                        <SelectItem key={ambulance.id} value={ambulance.id}>
                          {ambulance.regNumber} · {formatStatus(ambulance.type)} · {driverName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>{hint()}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Discard
            </Button>
            <Button type="submit" disabled={dispatch.isPending}>
              <Send aria-hidden="true" />
              {dispatch.isPending ? 'Dispatching...' : 'Dispatch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
