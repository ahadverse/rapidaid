'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { completeTripAction } from '@/app/actions/trips';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { unwrap } from '@/lib/api/action-result';
import type { Trip } from '@/lib/api/types';
import { formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';
import { completeTripSchema, type CompleteTripValues } from '@/lib/validation/trip';

type CompleteTripDialogProps = {
  trip: Trip | null;
  onClose: () => void;
};

export function CompleteTripDialog({ trip, onClose }: CompleteTripDialogProps) {
  const queryClient = useQueryClient();
  const [completed, setCompleted] = useState<Trip | null>(null);
  const { control, handleSubmit, reset } = useForm<CompleteTripValues>({
    resolver: zodResolver(completeTripSchema),
    defaultValues: { distanceKm: '' },
    mode: 'onChange',
  });

  const complete = useMutation({
    mutationFn: async (values: CompleteTripValues) =>
      trip ? unwrap(await completeTripAction(trip.id, values)).data : null,
    onSuccess: (data) => {
      setCompleted(data);
      toast.success('Trip completed');
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.me() });
    },
  });

  const close = () => {
    setCompleted(null);
    reset();
    onClose();
  };

  return (
    <Dialog open={trip !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        {completed ? (
          <>
            <DialogHeader>
              <DialogTitle>Trip completed</DialogTitle>
              <DialogDescription>
                The fare was calculated from the distance you recorded.
              </DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-4 py-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Distance</dt>
                <dd className="font-medium">{Number(completed.distanceKm ?? 0)} km</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Fare</dt>
                <dd className="text-lg font-semibold">{formatMoney(completed.fare ?? 0)}</dd>
              </div>
            </dl>
            <DialogFooter>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit((values) => complete.mutate(values))} noValidate>
            <DialogHeader>
              <DialogTitle>Complete trip</DialogTitle>
              <DialogDescription>
                Enter the distance travelled. The fare is calculated from it.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Controller
                name="distanceKm"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="complete-distance">Distance (km)</FieldLabel>
                    <Input
                      {...field}
                      id="complete-distance"
                      inputMode="decimal"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>
                Back
              </Button>
              <Button type="submit" disabled={complete.isPending}>
                {complete.isPending ? 'Completing...' : 'Complete trip'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
