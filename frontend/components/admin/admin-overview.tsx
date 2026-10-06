'use client';

import { useQuery } from '@tanstack/react-query';
import { Ambulance, Banknote, ClipboardList, Route } from 'lucide-react';
import { getDashboardStatsAction, getTripReportAction } from '@/app/actions/admin';
import { DailyTrendChart, RequestsByStatusChart } from '@/components/admin/lazy-charts';
import { CardSkeleton } from '@/components/shared/card-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { StatCard } from '@/components/shared/stat-card';
import { StatSkeleton } from '@/components/shared/stat-skeleton';
import { unwrap } from '@/lib/api/action-result';
import { fillDailySeries } from '@/lib/chart';
import { formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const STATS_REFRESH_MS = 60_000;

function TrendSkeletons() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <CardSkeleton lines={6} />
      <CardSkeleton lines={6} />
    </div>
  );
}

export function AdminOverview() {
  const stats = useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: async () => unwrap(await getDashboardStatsAction()).data,
    refetchInterval: STATS_REFRESH_MS,
    meta: { silent: true },
  });

  const report = useQuery({
    queryKey: queryKeys.admin.tripReport({ range: 'default' }),
    queryFn: async () => fillDailySeries(unwrap(await getTripReportAction()).data),
    meta: { silent: true },
  });

  if (stats.isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
        <CardSkeleton lines={6} />
        <TrendSkeletons />
      </div>
    );
  }

  if (stats.isError) {
    return <ErrorState title="Could not load the dashboard" onRetry={() => void stats.refetch()} />;
  }

  const { data } = stats;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total requests"
          value={data.emergencyRequests.total}
          icon={ClipboardList}
          hint={`${data.emergencyRequests.byStatus.PENDING} awaiting dispatch`}
        />
        <StatCard
          label="Active trips"
          value={data.trips.active}
          icon={Route}
          hint={`${data.trips.dispatchedToday} dispatched today`}
        />
        <StatCard
          label="Available ambulances"
          value={data.ambulances.byStatus.AVAILABLE}
          icon={Ambulance}
          hint={`of ${data.ambulances.total} in the fleet`}
        />
        <StatCard
          label="Revenue collected"
          value={formatMoney(data.revenue.collected)}
          icon={Banknote}
          hint={`${formatMoney(data.revenue.outstanding)} outstanding`}
        />
      </div>
      <RequestsByStatusChart stats={data} />
      {report.isPending ? (
        <TrendSkeletons />
      ) : report.isError ? (
        <ErrorState title="Could not load the trends" onRetry={() => void report.refetch()} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <DailyTrendChart
            title="Trips over time"
            description="Trips completed per day over the last 30 days."
            data={report.data}
            dataKey="trips"
            seriesLabel="Trips"
            color="var(--chart-1)"
            format={String}
          />
          <DailyTrendChart
            title="Revenue trend"
            description="Fares from completed trips per day over the last 30 days."
            data={report.data}
            dataKey="revenue"
            seriesLabel="Fares"
            color="var(--chart-2)"
            format={formatMoney}
          />
        </div>
      )}
    </div>
  );
}
