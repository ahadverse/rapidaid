import { z } from 'zod';
import { HOSPITAL_PHONE_REGEX } from './common';

export const parseSpecializations = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const hospitalFormSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  address: z.string().trim().min(5, 'Address must be at least 5 characters'),
  area: z.string().trim().min(2, 'Area is required'),
  phone: z.string().trim().regex(HOSPITAL_PHONE_REGEX, 'Phone must be a valid contact number'),
  specializations: z
    .string()
    .refine((value) => parseSpecializations(value).length > 0, 'Add at least one specialization')
    .refine(
      (value) => parseSpecializations(value).every((item) => item.length >= 2),
      'Each specialization needs at least 2 characters',
    ),
  availableBeds: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\d+$/.test(value),
      'Available beds must be a whole number',
    ),
});

export type HospitalFormValues = z.infer<typeof hospitalFormSchema>;
