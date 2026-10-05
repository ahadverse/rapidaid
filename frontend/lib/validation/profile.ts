import { z } from 'zod';
import { BD_PHONE_REGEX, PASSWORD_MIN_LENGTH } from './common';

export const profileSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  phone: z.string().trim().regex(BD_PHONE_REGEX, 'Phone must be a valid Bangladeshi number'),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    confirmPassword: z.string().min(1, 'Please confirm the new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((values) => values.oldPassword !== values.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the old password',
  });

export type ProfileValues = z.infer<typeof profileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
