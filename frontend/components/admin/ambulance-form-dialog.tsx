'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { saveAmbulanceAction } from '@/app/actions/ambulances';
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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { unwrap } from '@/lib/api/action-result';
import { AMBULANCE_TYPES, type AmbulanceRecord } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { ambulanceFormSchema, type AmbulanceFormValues } from '@/lib/validation/ambulance';

const EMPTY: AmbulanceFormValues = {
  regNumber: '',
  type: 'BASIC',
  baseFare: '',
  perKmRate: '',
  stationArea: '',
};

export type AmbulanceDialogState = { ambulance: AmbulanceRecord | null } | null;

type AmbulanceFormDialogProps = {
  state: AmbulanceDialogState;
  onClose: () => void;
};

const TEXT_FIELDS: {
  name: 'regNumber' | 'baseFare' | 'perKmRate' | 'stationArea';
  label: string;
}[] = [
  { name: 'regNumber', label: 'Registration number' },
  { name: 'stationArea', label: 'Station area' },
  { name: 'baseFare', label: 'Base fare (BDT)' },
  { name: 'perKmRate', label: 'Rate per km (BDT)' },
];

export function AmbulanceFormDialog({ state, onClose }: AmbulanceFormDialogProps) {
  const queryClient = useQueryClient();
  const ambulance = state?.ambulance ?? null;
  const { control, handleSubmit, reset } = useForm<AmbulanceFormValues>({
    resolver: zodResolver(ambulanceFormSchema),
    defaultValues: EMPTY,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!state) {
      return;
    }

    reset(
      ambulance
        ? {
            regNumber: ambulance.regNumber,
            type: ambulance.type,
            baseFare: String(Number(ambulance.baseFare)),
            perKmRate: String(Number(ambulance.perKmRate)),
            stationArea: ambulance.stationArea,
          }
        : EMPTY,
    );
  }, [state, ambulance, reset]);

  const save = useMutation({
    mutationFn: async (values: AmbulanceFormValues) =>
      unwrap(await saveAmbulanceAction(ambulance?.id ?? null, values)),
    onSuccess: () => {
      toast.success(ambulance ? 'Ambulance updated' : 'Ambulance added');
      void queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });
      onClose();
    },
  });

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit((values) => save.mutate(values))} noValidate>
          <DialogHeader>
            <DialogTitle>{ambulance ? 'Edit ambulance' : 'Add ambulance'}</DialogTitle>
            <DialogDescription>
              Fares here drive the trip total shown when a driver completes a trip.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            {TEXT_FIELDS.map(({ name, label }) => (
              <Controller
                key={name}
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`ambulance-${name}`}>{label}</FieldLabel>
                    <Input
                      {...field}
                      id={`ambulance-${name}`}
                      inputMode={
                        name === 'baseFare' || name === 'perKmRate' ? 'decimal' : undefined
                      }
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ))}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="ambulance-type">Type</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="ambulance-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AMBULANCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatStatus(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Discard
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Saving...' : ambulance ? 'Save changes' : 'Add ambulance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
