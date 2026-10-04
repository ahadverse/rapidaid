'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateRequestAction } from '@/app/actions/emergency-requests';
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
import { Textarea } from '@/components/ui/textarea';
import { unwrap } from '@/lib/api/action-result';
import { AMBULANCE_TYPES, PRIORITIES, type EmergencyRequest } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { updateRequestSchema, type UpdateRequestValues } from '@/lib/validation/emergency-request';

const ANY_TYPE = 'ANY';

type EditRequestDialogProps = {
  request: EmergencyRequest | null;
  onClose: () => void;
};

export function EditRequestDialog({ request, onClose }: EditRequestDialogProps) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm<UpdateRequestValues>({
    resolver: zodResolver(updateRequestSchema),
    defaultValues: {
      pickupAddress: '',
      patientCondition: '',
      priority: 'MEDIUM',
      requestedAmbulanceType: null,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (request) {
      reset({
        pickupAddress: request.pickupAddress,
        patientCondition: request.patientCondition,
        priority: request.priority,
        requestedAmbulanceType: request.requestedAmbulanceType,
      });
    }
  }, [request, reset]);

  const update = useMutation({
    mutationFn: async (values: UpdateRequestValues) =>
      request ? unwrap(await updateRequestAction(request.id, values)) : null,
    onSuccess: () => {
      toast.success('Request updated');
      void queryClient.invalidateQueries({ queryKey: queryKeys.emergencyRequests.all });
      onClose();
    },
  });

  return (
    <Dialog open={request !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit((values) => update.mutate(values))} noValidate>
          <DialogHeader>
            <DialogTitle>Edit request</DialogTitle>
            <DialogDescription>
              You can change the details until an ambulance is dispatched.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Controller
              name="pickupAddress"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-address">Pickup address</FieldLabel>
                  <Input {...field} id="edit-address" aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="patientCondition"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="edit-condition">Patient condition</FieldLabel>
                  <Textarea
                    {...field}
                    id="edit-condition"
                    rows={3}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="edit-priority">Priority</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="edit-priority" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {formatStatus(priority)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                name="requestedAmbulanceType"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="edit-type">Ambulance type</FieldLabel>
                    <Select
                      value={field.value ?? ANY_TYPE}
                      onValueChange={(value) => field.onChange(value === ANY_TYPE ? null : value)}
                    >
                      <SelectTrigger id="edit-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ANY_TYPE}>Any available</SelectItem>
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
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Discard
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
