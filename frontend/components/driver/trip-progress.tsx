import type { TripStatus } from '@/lib/api/types';
import { TRIP_STAGES } from '@/lib/trip-flow';
import { cn } from '@/lib/utils';

export function TripProgress({ status }: { status: TripStatus }) {
  const current = TRIP_STAGES.findIndex((stage) => stage.status === status);

  if (current === -1) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium">
          Step {current + 1} of {TRIP_STAGES.length}
        </span>
        <span className="text-muted-foreground">{TRIP_STAGES[current].label}</span>
      </div>
      <ol className="grid grid-cols-5 gap-1.5" aria-label="Trip progress">
        {TRIP_STAGES.map((stage, index) => (
          <li key={stage.status} aria-current={index === current ? 'step' : undefined}>
            <span
              aria-hidden="true"
              className={cn(
                'block h-1.5 rounded-full',
                index < current && 'bg-success',
                index === current && 'bg-info',
                index > current && 'bg-muted',
              )}
            />
            <span
              className={cn(
                'sr-only text-[11px] sm:not-sr-only sm:mt-1.5 sm:block sm:truncate',
                index > current && 'text-muted-foreground',
              )}
            >
              {stage.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
