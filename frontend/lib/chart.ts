import type { DailyTripRow, TripReport } from '@/lib/api/types';

const DAY_MS = 24 * 60 * 60 * 1000;

const dayLabel = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export type DailyPoint = DailyTripRow & { label: string };

// The report omits days with no completed trips, which would draw a misleading straight line.
export function fillDailySeries(report: TripReport): DailyPoint[] {
  const byDate = new Map(report.daily.map((row) => [row.date, row]));
  const end = Date.parse(report.range.to);
  const points: DailyPoint[] = [];

  for (let time = Date.parse(report.range.from); time <= end; time += DAY_MS) {
    const date = new Date(time).toISOString().slice(0, 10);
    const row = byDate.get(date);

    points.push({
      date,
      label: dayLabel.format(new Date(time)),
      trips: row?.trips ?? 0,
      revenue: row?.revenue ?? 0,
    });
  }

  return points;
}
