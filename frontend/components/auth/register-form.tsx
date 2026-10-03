'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type Path } from 'react-hook-form';
import { toast } from 'sonner';
import { registerAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation/common';
import { registerSchema, type RegisterValues } from '@/lib/validation/auth';

const fields: {
  name: Path<RegisterValues>;
  label: string;
  type: string;
  autoComplete: string;
  placeholder?: string;
  hint?: string;
}[] = [
  { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    autoComplete: 'email',
    placeholder: 'you@example.com',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    autoComplete: 'tel',
    placeholder: '01712345678',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    autoComplete: 'new-password',
    hint: `At least ${PASSWORD_MIN_LENGTH} characters`,
  },
];

export function RegisterForm() {
  const { control, handleSubmit, setError, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '' },
    mode: 'onChange',
  });

  async function onSubmit(values: RegisterValues) {
    const result = await registerAction(values);

    for (const [name, message] of Object.entries(result.fieldErrors ?? {})) {
      if (name in values) {
        setError(name as Path<RegisterValues>, { message });
      }
    }

    toast.error(result.error ?? 'Registration failed');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        {fields.map(({ name, label, type, autoComplete, placeholder, hint }) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`register-${name}`}>{label}</FieldLabel>
                <Input
                  {...field}
                  id={`register-${name}`}
                  type={type}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  aria-invalid={fieldState.invalid}
                />
                {hint && !fieldState.invalid ? <FieldDescription>{hint}</FieldDescription> : null}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        ))}
        <Button type="submit" size="lg" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </FieldGroup>
    </form>
  );
}
