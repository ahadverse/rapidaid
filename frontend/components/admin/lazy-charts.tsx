'use client';

import dynamic from 'next/dynamic';
import { CardSkeleton } from '@/components/shared/card-skeleton';

const loading = () => <CardSkeleton lines={5} />;

export const BarBreakdownChart = dynamic(
  () => import('@/components/admin/bar-breakdown-chart').then((mod) => mod.BarBreakdownChart),
  { ssr: false, loading },
);

export const DailyTrendChart = dynamic(
  () => import('@/components/admin/daily-trend-chart').then((mod) => mod.DailyTrendChart),
  { ssr: false, loading },
);

export const RequestsByStatusChart = dynamic(
  () =>
    import('@/components/admin/requests-by-status-chart').then((mod) => mod.RequestsByStatusChart),
  { ssr: false, loading },
);
