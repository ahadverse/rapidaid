'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateMeAction } from '@/app/actions/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { unwrap } from '@/lib/api/action-result';
import type { UserProfile } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';
import { profileSchema, type ProfileValues } from '@/lib/validation/profile';

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, formState } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile.name, phone: profile.phone ?? '' },
    mode: 'onChange',
  });

  const update = useMutation({
    mutationFn: async (values: ProfileValues) => unwrap(await updateMeAction(values)).data,
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.me() });
      const previous = queryClient.getQueryData<UserProfile>(queryKeys.users.me());

      queryClient.setQueryData<UserProfile>(queryKeys.users.me(), (current) =>
        current ? { ...current, ...values } : current,
      );

      return { previous };
    },
    onError: (_error, _values, context) => {
      queryClient.setQueryData(queryKeys.users.me(), context?.previous);
    },
    onSuccess: (saved) => {
      toast.success('Profile updated');
      reset({ name: saved.name, phone: saved.phone ?? '' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.me() }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal details</CardTitle>
        <CardDescription>Dispatchers use these to reach you during an emergency.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((values) => update.mutate(values))} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input id="profile-email" value={profile.email} readOnly disabled />
              <FieldDescription>Your email is your sign-in and cannot be changed.</FieldDescription>
            </Field>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
                  <Input
                    {...field}
                    id="profile-name"
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
                  <Input
                    {...field}
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Button type="submit" disabled={update.isPending || !formState.isDirty}>
              {update.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
