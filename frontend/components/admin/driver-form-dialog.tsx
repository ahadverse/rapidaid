'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { listAmbulancesPageAction } from '@/app/actions/ambulances';
import { createDriverAction } from '@/app/actions/drivers';
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
import { queryKeys } from '@/lib/query/keys';
import { NO_AMBULANCE, driverFormSchema, type DriverFormValues } from '@/lib/validation/driver';

const EMPTY: DriverFormValues = {
  name: '',
  email: '',
  password: '',
  phone: '',
  licenseNumber: '',
  nid: '',
  ambulanceId: NO_AMBULANCE,
};

const TEXT_FIELDS: {
  name: Exclude<keyof DriverFormValues, 'ambulanceId'>;
  label: string;
  type?: string;
  autoComplete?: string;
}[] = [
  { name: 'name', label: 'Full name', autoComplete: 'off' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'off' },
  { name: 'password', label: 'Temporary password', type: 'password', autoComplete: 'new-password' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'off' },
  { name: 'licenseNumber', label: 'License number' },
  { name: 'nid', label: 'NID' },
];

type DriverFormDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function DriverFormDialog({ open, onClose }: DriverFormDialogProps) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: EMPTY,
    mode: 'onChange',
  });

  const ambulances = useQuery({
    queryKey: queryKeys.ambulances.list({ picker: true }),
    queryFn: async () =>
      unwrap(
        await listAmbulancesPageAction({
          page: 1,
          limit: 100,
          sortBy: 'regNumber',
          sortOrder: 'asc',
        }),
      ).data,
    meta: { silent: true },
    enabled: open,
  });

  function close() {
    reset(EMPTY);
    onClose();
  }

  const create = useMutation({
    mutationFn: async (values: DriverFormValues) => unwrap(await createDriverAction(values)),
    onSuccess: () => {
      toast.success('Driver account created');
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      close();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit((values) => create.mutate(values))} noValidate>
          <DialogHeader>
            <DialogTitle>Add driver</DialogTitle>
            <DialogDescription>
              Creates the sign-in account and the driver profile together.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            {TEXT_FIELDS.map(({ name, label, type, autoComplete }) => (
              <Controller
                key={name}
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`driver-${name}`}>{label}</FieldLabel>
                    <Input
                      {...field}
                      id={`driver-${name}`}
                      type={type}
                      autoComplete={autoComplete}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ))}
            <Controller
              name="ambulanceId"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="driver-ambulance">Ambulance</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="driver-ambulance" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_AMBULANCE}>No ambulance yet</SelectItem>
                      {ambulances.data?.map((ambulance) => (
                        <SelectItem key={ambulance.id} value={ambulance.id}>
                          {ambulance.regNumber} · {formatStatus(ambulance.type)} ·{' '}
                          {ambulance.stationArea}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Discard
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating...' : 'Create driver'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
