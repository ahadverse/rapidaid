'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { AuditLog, DashboardStats, TripReport } from '@/lib/api/types';

export async function getDashboardStatsAction(): Promise<ActionResult<DashboardStats>> {
  return authedAction<DashboardStats>('/admin/dashboard-stats');
}

export async function getTripReportAction(): Promise<ActionResult<TripReport>> {
  return authedAction<TripReport>('/admin/reports/trips');
}

export async function listAuditLogsAction(query: {
  page: number;
  limit: number;
  entity?: string;
  actorId?: string;
}): Promise<ActionResult<AuditLog[]>> {
  return authedAction<AuditLog[]>('/admin/audit-logs', {
    query: { ...query, sortBy: 'createdAt', sortOrder: 'desc' },
  });
}
