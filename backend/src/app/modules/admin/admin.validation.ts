import { z } from 'zod';

const dateBound = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), `${label} must be a valid date`);

const auditLogs = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    entity: z.string().trim().min(2, 'Entity is too short').optional(),
    action: z.string().trim().min(2, 'Action is too short').optional(),
    actorId: z.uuid('A valid actor id is required').optional(),
    from: dateBound('from').optional(),
    to: dateBound('to').optional(),
  }),
});

const report = z.object({
  query: z.object({
    from: dateBound('from').optional(),
    to: dateBound('to').optional(),
  }),
});

export const AdminValidation = { auditLogs, report };
