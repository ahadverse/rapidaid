'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { changePasswordAction } from '@/app/actions/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { unwrap } from '@/lib/api/action-result';
import { changePasswordSchema, type ChangePasswordValues } from '@/lib/validation/profile';

const fields = [
  { name: 'oldPassword', label: 'Current password', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'New password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm new password', autoComplete: 'new-password' },
] as const;

export function PasswordForm() {
  const { control, handleSubmit, reset } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const change = useMutation({
    mutationFn: async (values: ChangePasswordValues) => unwrap(await changePasswordAction(values)),
    onSuccess: () => {
      toast.success('Password changed');
      reset();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Your current password is checked before the change applies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((values) => change.mutate(values))} noValidate>
          <FieldGroup>
            {fields.map(({ name, label, autoComplete }) => (
              <Controller
                key={name}
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`password-${name}`}>{label}</FieldLabel>
                    <Input
                      {...field}
                      id={`password-${name}`}
                      type="password"
                      autoComplete={autoComplete}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ))}
            <Button type="submit" disabled={change.isPending}>
              {change.isPending ? 'Updating...' : 'Update password'}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
