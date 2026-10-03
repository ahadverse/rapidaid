import { z } from 'zod';
import { BD_PHONE_REGEX } from './common';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(BD_PHONE_REGEX, 'Phone must be a valid Bangladeshi number')
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'Tell us a little more, at least 10 characters')
    .max(1000, 'Message must be 1000 characters or fewer'),
});

export type ContactValues = z.infer<typeof contactSchema>;
