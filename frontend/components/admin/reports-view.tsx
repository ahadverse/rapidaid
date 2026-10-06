'use client';

import { useQuery } from '@tanstack/react-query';
import { Banknote, CheckCircle2, MapPinned, Receipt, Route, XCircle } from 'lucide-react';
import { getTripReportAction } from '@/app/actions/admin';
import { BarBreakdownChart } from '@/components/admin/bar-breakdown-chart';
import { DailyTrendChart } from '@/components/admin/daily-trend-chart';
import { CardSkeleton } from '@/components/shared/card-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatSkeleton } from '@/components/shared/stat-skeleton';
import { formatStatus } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUrlQuery } from '@/hooks/use-url-query';
import { unwrap } from '@/lib/api/action-result';
import { PRIORITIES, TRIP_STATUSES } from '@/lib/api/types';
import { fillDailySeries } from '@/lib/chart';
import { formatMoney } from '@/lib/format';
import { queryKeys } from '@/lib/query/keys';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// The picker yields a calendar day; the backend compares instants, so the day is pinned to Dhaka.
const startOfDay = (day: string) => `${day}T00:00:00+06:00`;
const endOfDay = (day: string) => `${day}T23:59:59.999+06:00`;

export function ReportsView() {
  const { get, set, reset } = useUrlQuery();
  const rawFrom = get('from');
  const rawTo = get('to');
  const from = DATE.test(rawFrom) ? rawFrom : undefined;
  const to = DATE.test(rawTo) ? rawTo : undefined;

  const params = {
    from: from ? startOfDay(from) : undefined,
    to: to ? endOfDay(to) : undefined,
  };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.admin.tripReport(params),
    queryFn: async () => unwrap(await getTripReportAction(params)).data,
    meta: { silent: true },
    placeholderData: (previous) => previous,
  });

  const series = data ? fillDailySeries(data) : [];
  const rangeText = from || to ? 'the selected range' : 'the last 30 days';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Trip volume, revenue and demand over a date range."
        actions={
          <>
            <label className="flex items-center gap-2 text-sm">
              From
              <Input
                type="date"
                value={from ?? ''}
                max={to}
                onChange={(event) => set({ from: event.target.value })}
                className="w-40"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              To
              <Input
                type="date"
                value={to ?? ''}
                min={from}
                onChange={(event) => set({ to: event.target.value })}
                className="w-40"
              />
            </label>
            {from || to ? (
              <Button variant="outline" size="sm" onClick={reset}>
                Last 30 days
              </Button>
            ) : null}
          </>
        }
      />
      {isPending ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <CardSkeleton lines={6} />
            <CardSkeleton lines={6} />
          </div>
        </div>
      ) : isError ? (
        <ErrorState title="Could not load the report" onRetry={() => void refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Completed trips"
              value={data.trips.completed}
              icon={CheckCircle2}
              hint={`${data.trips.totalDistanceKm} km driven`}
            />
            <StatCard label="Cancelled trips" value={data.trips.cancelled} icon={XCircle} />
            <StatCard
              label="Revenue collected"
              value={formatMoney(data.revenue.collected)}
              icon={Banknote}
              hint={`${data.revenue.paidPayments} paid · ${formatMoney(data.revenue.billed)} billed`}
            />
            <StatCard
              label="Average fare"
              value={formatMoney(data.trips.averageFare)}
              icon={Receipt}
              hint="Per completed trip"
            />
            <StatCard
              label="Average distance"
              value={`${data.trips.averageDistanceKm} km`}
              icon={Route}
              hint="Per completed trip"
            />
            <StatCard
              label="Top hospital"
              value={data.topHospitals[0]?.name ?? '—'}
              icon={MapPinned}
              hint={
                data.topHospitals[0]
                  ? `${data.topHospitals[0].trips} trips`
                  : 'No hospital trips yet'
              }
            />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <BarBreakdownChart
              title="Trips by status"
              description={`Trips dispatched in ${rangeText}.`}
              rows={TRIP_STATUSES.map((status) => ({
                label: formatStatus(status),
                value: data.trips.byStatus[status] ?? 0,
              }))}
              seriesLabel="Trips"
              color="var(--chart-1)"
              labelWidth={170}
            />
            <BarBreakdownChart
              title="Requests by priority"
              description={`Emergency requests raised in ${rangeText}.`}
              rows={PRIORITIES.map((priority) => ({
                label: formatStatus(priority),
                value: data.emergencyRequests.byPriority[priority] ?? 0,
              }))}
              seriesLabel="Requests"
              color="var(--chart-2)"
            />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <DailyTrendChart
              title="Daily trend"
              description={`Trips completed per day in ${rangeText}.`}
              data={series}
              dataKey="trips"
              seriesLabel="Trips"
              color="var(--chart-1)"
              format={String}
            />
            <DailyTrendChart
              title="Daily revenue"
              description={`Fares from completed trips per day in ${rangeText}.`}
              data={series}
              dataKey="revenue"
              seriesLabel="Fares"
              color="var(--chart-2)"
              format={formatMoney}
            />
          </div>
          {data.topHospitals.length > 0 ? (
            <BarBreakdownChart
              title="Top hospitals"
              description={`Most used destinations in ${rangeText}.`}
              rows={data.topHospitals.map((hospital) => ({
                label: hospital.name,
                value: hospital.trips,
              }))}
              seriesLabel="Trips"
              color="var(--chart-1)"
              labelWidth={200}
            />
          ) : (
            <EmptyState
              icon={MapPinned}
              title="No hospital trips in this range"
              message="Hospitals appear here once drivers route patients to them."
            />
          )}
        </>
      )}
    </div>
  );
}
