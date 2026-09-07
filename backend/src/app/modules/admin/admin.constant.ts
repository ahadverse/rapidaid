export const auditLogSortableFields = ['createdAt', 'action', 'entity'] as const;

export const auditLogFilterableFields = ['entity', 'action', 'actorId', 'from', 'to'] as const;

export const reportFilterableFields = ['from', 'to'] as const;

export const DASHBOARD_CACHE_KEY = 'stats:dashboard';

export const DASHBOARD_CACHE_TTL_SECONDS = 60;

export const REPORT_DEFAULT_RANGE_DAYS = 30;

export const TOP_HOSPITAL_LIMIT = 5;

export const auditLogSelect = {
  id: true,
  action: true,
  entity: true,
  entityId: true,
  before: true,
  after: true,
  createdAt: true,
  actor: { select: { id: true, name: true, email: true, role: true } },
} as const;
