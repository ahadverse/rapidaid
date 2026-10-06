'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { saveHospitalAction } from '@/app/actions/hospitals';
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
import { Input } from '@/components/ui/input';
import { unwrap } from '@/lib/api/action-result';
import type { Hospital } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { hospitalFormSchema, type HospitalFormValues } from '@/lib/validation/hospital';

const EMPTY: HospitalFormValues = {
  name: '',
  address: '',
  area: '',
  phone: '',
  specializations: '',
  availableBeds: '',
};

export type HospitalDialogState = { hospital: Hospital | null } | null;

type HospitalFormDialogProps = {
  state: HospitalDialogState;
  onClose: () => void;
};

export function HospitalFormDialog({ state, onClose }: HospitalFormDialogProps) {
  const queryClient = useQueryClient();
  const hospital = state?.hospital ?? null;
  const { control, handleSubmit, reset } = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: EMPTY,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!state) {
      return;
    }

    reset(
      hospital
        ? {
            name: hospital.name,
            address: hospital.address,
            area: hospital.area,
            phone: hospital.phone,
            specializations: hospital.specializations.join(', '),
            availableBeds: String(hospital.availableBeds),
          }
        : EMPTY,
    );
  }, [state, hospital, reset]);

  const save = useMutation({
    mutationFn: async (values: HospitalFormValues) =>
      unwrap(await saveHospitalAction(hospital?.id ?? null, values)),
    onSuccess: () => {
      toast.success(hospital ? 'Hospital updated' : 'Hospital added');
      void queryClient.invalidateQueries({ queryKey: queryKeys.hospitals.all });
      onClose();
    },
  });

  const fields: { name: keyof HospitalFormValues; label: string; hint?: string }[] = [
    { name: 'name', label: 'Name' },
    { name: 'address', label: 'Address' },
    { name: 'area', label: 'Area' },
    { name: 'phone', label: 'Phone' },
    { name: 'specializations', label: 'Specializations', hint: 'Separate with commas' },
    { name: 'availableBeds', label: 'Available beds' },
  ];

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit((values) => save.mutate(values))} noValidate>
          <DialogHeader>
            <DialogTitle>{hospital ? 'Edit hospital' : 'Add hospital'}</DialogTitle>
            <DialogDescription>
              Dispatchers pick from these hospitals when a trip is heading in.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            {fields.map(({ name, label, hint }) => (
              <Controller
                key={name}
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`hospital-${name}`}>{label}</FieldLabel>
                    <Input
                      {...field}
                      id={`hospital-${name}`}
                      inputMode={name === 'availableBeds' ? 'numeric' : undefined}
                      aria-invalid={fieldState.invalid}
                    />
                    {hint ? <FieldDescription>{hint}</FieldDescription> : null}
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Discard
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Saving...' : hospital ? 'Save changes' : 'Add hospital'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
