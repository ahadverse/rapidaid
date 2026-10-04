'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { cancelRequestAction } from '@/app/actions/emergency-requests';
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
import type { EmergencyRequest } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { cancelRequestSchema, type CancelRequestValues } from '@/lib/validation/emergency-request';

type CancelRequestDialogProps = {
  request: EmergencyRequest | null;
  onClose: () => void;
};

export function CancelRequestDialog({ request, onClose }: CancelRequestDialogProps) {
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
      request ? unwrap(await cancelRequestAction(request.id, values)) : null,
    onSuccess: () => {
      toast.success('Request cancelled');
      void queryClient.invalidateQueries({ queryKey: queryKeys.emergencyRequests.all });
      close();
    },
  });

  return (
    <Dialog open={request !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <form onSubmit={handleSubmit((values) => cancel.mutate(values))} noValidate>
          <DialogHeader>
            <DialogTitle>Cancel this request?</DialogTitle>
            <DialogDescription>
              No ambulance has been dispatched yet. Once cancelled, the request cannot be reopened.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Controller
              name="cancelReason"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="cancel-reason">Reason</FieldLabel>
                  <Textarea
                    {...field}
                    id="cancel-reason"
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
              Keep request
            </Button>
            <Button type="submit" variant="destructive" disabled={cancel.isPending}>
              {cancel.isPending ? 'Cancelling...' : 'Cancel request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
