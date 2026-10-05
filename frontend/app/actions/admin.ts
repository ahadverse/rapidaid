'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { DashboardStats, TripReport } from '@/lib/api/types';

export async function getDashboardStatsAction(): Promise<ActionResult<DashboardStats>> {
  return authedAction<DashboardStats>('/admin/dashboard-stats');
}

export async function getTripReportAction(): Promise<ActionResult<TripReport>> {
  return authedAction<TripReport>('/admin/reports/trips');
}
