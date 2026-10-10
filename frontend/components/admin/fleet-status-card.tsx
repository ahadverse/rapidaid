import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AmbulanceStatus } from '@/lib/api/types';
import { formatStatus } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';

const ROWS: { status: AmbulanceStatus; bar: string }[] = [
  { status: 'AVAILABLE', bar: 'bg-success' },
  { status: 'ON_TRIP', bar: 'bg-info' },
  { status: 'MAINTENANCE', bar: 'bg-warning' },
];

type FleetStatusCardProps = {
  total: number;
  byStatus: Record<AmbulanceStatus, number>;
};

export function FleetStatusCard({ total, byStatus }: FleetStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet status</CardTitle>
        <CardDescription>{total} ambulances across all stations.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {ROWS.map(({ status, bar }) => {
            const count = byStatus[status];
            const share = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <li key={status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{formatStatus(status)}</span>
                  <span className="font-medium tabular-nums">{count}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${formatStatus(status)} share of fleet`}
                  aria-valuenow={share}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 overflow-hidden rounded-full bg-muted"
                >
                  <div className={cn('h-full rounded-full', bar)} style={{ width: `${share}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
