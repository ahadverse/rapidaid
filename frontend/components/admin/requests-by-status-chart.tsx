'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from '@/components/admin/chart-card';
import { ChartTooltip } from '@/components/admin/chart-tooltip';
import { formatStatus } from '@/components/shared/status-badge';
import { REQUEST_STATUSES, type DashboardStats } from '@/lib/api/types';

const COLOR = 'var(--chart-1)';
const AXIS_TEXT = { fill: 'var(--muted-foreground)', fontSize: 12 };

export function RequestsByStatusChart({ stats }: { stats: DashboardStats }) {
  const data = REQUEST_STATUSES.map((status) => ({
    status: formatStatus(status),
    count: stats.emergencyRequests.byStatus[status],
  }));

  return (
    <ChartCard
      title="Requests by status"
      description="Every emergency request, grouped by where it stands now."
      summary={data.map((row) => ({ label: row.status, value: String(row.count) }))}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 28 }}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={AXIS_TEXT}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="status"
            width={150}
            tick={AXIS_TEXT}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={label}
                format={String}
                color={COLOR}
                seriesLabel="Requests"
              />
            )}
          />
          <Bar dataKey="count" fill={COLOR} radius={[0, 4, 4, 0]} barSize={18}>
            <LabelList
              dataKey="count"
              position="right"
              style={{ fill: 'var(--foreground)', fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
