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

const AXIS_TEXT = { fill: 'var(--muted-foreground)', fontSize: 12 };

export type BreakdownRow = { label: string; value: number };

type BarBreakdownChartProps = {
  title: string;
  description: string;
  rows: BreakdownRow[];
  seriesLabel: string;
  color: string;
  labelWidth?: number;
};

export function BarBreakdownChart({
  title,
  description,
  rows,
  seriesLabel,
  color,
  labelWidth = 150,
}: BarBreakdownChartProps) {
  return (
    <ChartCard
      title={title}
      description={description}
      summary={rows.map((row) => ({ label: row.label, value: String(row.value) }))}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 28 }}>
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
            dataKey="label"
            width={labelWidth}
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
                color={color}
                seriesLabel={seriesLabel}
              />
            )}
          />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} barSize={18}>
            <LabelList
              dataKey="value"
              position="right"
              style={{ fill: 'var(--foreground)', fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
