import { z } from 'zod';
import { BD_PHONE_REGEX, PASSWORD_MIN_LENGTH } from './common';

const email = z.string().trim().toLowerCase().pipe(z.email('A valid email is required'));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
  phone: z.string().trim().regex(BD_PHONE_REGEX, 'Phone must be a valid Bangladeshi number'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
