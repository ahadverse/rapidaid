'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch, type FieldPath, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { createRequestAction } from '@/app/actions/emergency-requests';
import { formatStatus } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { unwrap } from '@/lib/api/action-result';
import { AMBULANCE_TYPES, PRIORITIES, type AmbulanceType } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { cn } from '@/lib/utils';
import {
  ambulanceStepSchema,
  conditionStepSchema,
  createRequestSchema,
  pickupStepSchema,
  type CreateRequestValues,
} from '@/lib/validation/emergency-request';
import { useRequestWizardStore } from '@/stores/request-wizard-store';

const ANY_TYPE = 'ANY';

const steps = [
  { title: 'Pickup', schema: pickupStepSchema, fields: ['pickupAddress'] },
  { title: 'Condition', schema: conditionStepSchema, fields: ['patientCondition', 'priority'] },
  { title: 'Ambulance', schema: ambulanceStepSchema, fields: ['requestedAmbulanceType'] },
] as const satisfies readonly {
  title: string;
  schema: unknown;
  fields: readonly FieldPath<CreateRequestValues>[];
}[];

const stepHints = [
  'Where should the ambulance meet the patient?',
  'Tell us what happened so we can prioritise correctly.',
  'Choose a vehicle type, then review and confirm.',
];

const typeDescriptions: Record<AmbulanceType, string> = {
  BASIC: 'standard transport',
  AC: 'air-conditioned transport',
  ICU: 'life support and trained crew',
  FREEZER: 'mortuary transport',
};

// Validating only the current step's schema lets one form span all three steps.
const stepResolver: Resolver<CreateRequestValues> = (values, context, options) =>
  zodResolver(
    steps[useRequestWizardStore.getState().step].schema as unknown as z.ZodType<
      CreateRequestValues,
      CreateRequestValues
    >,
  )(values, context, options);

export function RequestWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const { step, setStep, updateDraft, reset: resetWizard } = useRequestWizardStore();

  const { control, handleSubmit, trigger, getValues, reset } = useForm<CreateRequestValues>({
    resolver: stepResolver,
    defaultValues: {
      pickupAddress: '',
      patientCondition: '',
      priority: 'MEDIUM',
      requestedAmbulanceType: null,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    void Promise.resolve(useRequestWizardStore.persist.rehydrate()).then(() => {
      reset(useRequestWizardStore.getState().draft);
      setHydrated(true);
    });
  }, [reset]);

  const watched = useWatch({ control });

  useEffect(() => {
    if (hydrated) {
      updateDraft(watched);
    }
  }, [hydrated, watched, updateDraft]);

  const submit = useMutation({
    mutationFn: async (values: CreateRequestValues) => unwrap(await createRequestAction(values)),
    onSuccess: () => {
      toast.success('Request submitted');
      resetWizard();
      void queryClient.invalidateQueries({ queryKey: queryKeys.emergencyRequests.all });
      router.push('/dashboard');
    },
  });

  if (!hydrated) {
    return <Skeleton className="h-80 w-full" />;
  }

  const isLast = step === steps.length - 1;
  const values = getValues();

  async function next() {
    if (await trigger([...steps[step].fields])) {
      setStep(step + 1);
    }
  }

  function onSubmit(formValues: CreateRequestValues) {
    const parsed = createRequestSchema.safeParse(formValues);

    if (parsed.success) {
      submit.mutate(parsed.data);
    } else {
      toast.error(parsed.error.issues[0]?.message ?? 'Please check the form');
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <ol className="flex items-center gap-2" aria-label="Progress">
          {steps.map(({ title }, index) => (
            <li
              key={title}
              aria-current={index === step ? 'step' : undefined}
              className="flex flex-1 items-center gap-2 text-sm"
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                  index < step && 'border-primary bg-primary text-primary-foreground',
                  index === step && 'border-primary text-primary',
                  index > step && 'text-muted-foreground',
                )}
              >
                {index < step ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden sm:inline',
                  index === step ? 'font-medium' : 'text-muted-foreground',
                )}
              >
                {title}
              </span>
            </li>
          ))}
        </ol>
        <div>
          <CardTitle>
            Step {step + 1} of {steps.length} · {steps[step].title}
          </CardTitle>
          <CardDescription>{stepHints[step]}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {step === 0 ? (
              <Controller
                name="pickupAddress"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="wizard-address">Pickup address</FieldLabel>
                    <Input
                      {...field}
                      id="wizard-address"
                      autoComplete="street-address"
                      placeholder="House, road, area"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ) : null}
            {step === 1 ? (
              <>
                <Controller
                  name="patientCondition"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="wizard-condition">Patient condition</FieldLabel>
                      <Textarea
                        {...field}
                        id="wizard-condition"
                        rows={4}
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="wizard-priority">Priority</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="wizard-priority" className="w-full">
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
              </>
            ) : null}
            {step === 2 ? (
              <>
                <Controller
                  name="requestedAmbulanceType"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="wizard-type">Ambulance type</FieldLabel>
                      <Select
                        value={field.value ?? ANY_TYPE}
                        onValueChange={(value) => field.onChange(value === ANY_TYPE ? null : value)}
                      >
                        <SelectTrigger id="wizard-type" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ANY_TYPE}>Any available</SelectItem>
                          {AMBULANCE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {formatStatus(type)} · {typeDescriptions[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <dl className="grid gap-x-4 gap-y-2 rounded-lg border p-4 text-sm sm:grid-cols-[7rem_1fr]">
                  <dt className="text-muted-foreground">Pickup</dt>
                  <dd>{values.pickupAddress}</dd>
                  <dt className="text-muted-foreground">Condition</dt>
                  <dd>{values.patientCondition}</dd>
                  <dt className="text-muted-foreground">Priority</dt>
                  <dd>{formatStatus(values.priority)}</dd>
                </dl>
              </>
            ) : null}
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
              {isLast ? (
                <Button type="submit" disabled={submit.isPending}>
                  {submit.isPending ? 'Submitting...' : 'Confirm request'}
                </Button>
              ) : (
                <Button type="button" onClick={next}>
                  Continue
                </Button>
              )}
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
