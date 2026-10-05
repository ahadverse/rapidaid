'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from '@/components/admin/chart-card';
import { ChartTooltip } from '@/components/admin/chart-tooltip';
import type { DailyPoint } from '@/lib/chart';

const AXIS_TEXT = { fill: 'var(--muted-foreground)', fontSize: 12 };

type DailyTrendChartProps = {
  title: string;
  description: string;
  data: DailyPoint[];
  dataKey: 'trips' | 'revenue';
  seriesLabel: string;
  color: string;
  format: (value: number) => string;
};

export function DailyTrendChart({
  title,
  description,
  data,
  dataKey,
  seriesLabel,
  color,
  format,
}: DailyTrendChartProps) {
  return (
    <ChartCard
      title={title}
      description={description}
      summary={data.map((point) => ({ label: point.label, value: format(point[dataKey]) }))}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={AXIS_TEXT}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={AXIS_TEXT}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(value: number) =>
              dataKey === 'revenue' ? `${value / 1000}k` : String(value)
            }
          />
          <Tooltip
            cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
            content={({ active, payload, label }) => (
              <ChartTooltip
                active={active}
                payload={payload}
                label={label}
                format={format}
                color={color}
                seriesLabel={seriesLabel}
              />
            )}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, stroke: 'var(--card)', strokeWidth: 2, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
