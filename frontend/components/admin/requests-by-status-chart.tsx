'use client';

import { BarBreakdownChart } from '@/components/admin/bar-breakdown-chart';
import { formatStatus } from '@/components/shared/status-badge';
import { REQUEST_STATUSES, type DashboardStats } from '@/lib/api/types';

export function RequestsByStatusChart({ stats }: { stats: DashboardStats }) {
  return (
    <BarBreakdownChart
      title="Requests by status"
      description="Every emergency request, grouped by where it stands now."
      rows={REQUEST_STATUSES.map((status) => ({
        label: formatStatus(status),
        value: stats.emergencyRequests.byStatus[status],
      }))}
      seriesLabel="Requests"
      color="var(--chart-1)"
    />
  );
}
