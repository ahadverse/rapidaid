'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateTripStatusAction } from '@/app/actions/trips';
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
import { Textarea } from '@/components/ui/textarea';
import { unwrap } from '@/lib/api/action-result';
import type { Trip } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { cancelRequestSchema, type CancelRequestValues } from '@/lib/validation/emergency-request';

type CancelTripDialogProps = {
  trip: Trip | null;
  onClose: () => void;
};

export function CancelTripDialog({ trip, onClose }: CancelTripDialogProps) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset } = useForm<CancelRequestValues>({
    resolver: zodResolver(cancelRequestSchema),
    defaultValues: { cancelReason: '' },
    mode: 'onChange',
  });

  function close() {
    reset();
    onClose();
  }

  const cancel = useMutation({
    mutationFn: async (values: CancelRequestValues) =>
      trip ? unwrap(await updateTripStatusAction(trip.id, 'CANCELLED', values.cancelReason)) : null,
    onSuccess: () => {
      toast.success('Trip cancelled');
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.ambulances.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all });
      close();
    },
  });

  return (
    <Dialog open={trip !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <form onSubmit={handleSubmit((values) => cancel.mutate(values))} noValidate>
          <DialogHeader>
            <DialogTitle>Cancel this trip?</DialogTitle>
            <DialogDescription>
              The crew is released back to the dispatch pool and the patient is notified. A
              cancelled trip cannot be reopened.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Controller
              name="cancelReason"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="cancel-trip-reason">Reason</FieldLabel>
                  <Textarea
                    {...field}
                    id="cancel-trip-reason"
                    rows={3}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Keep trip
            </Button>
            <Button type="submit" variant="destructive" disabled={cancel.isPending}>
              {cancel.isPending ? 'Cancelling...' : 'Cancel trip'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
