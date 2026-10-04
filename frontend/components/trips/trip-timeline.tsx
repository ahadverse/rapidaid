import { Check, X } from 'lucide-react';
import type { Trip, TripStatus } from '@/lib/api/types';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

type Stamp = 'dispatchedAt' | 'pickedUpAt' | 'arrivedAt' | 'completedAt';
type StepState = 'done' | 'current' | 'upcoming' | 'cancelled';

type Step = {
  status: TripStatus;
  label: string;
  description: string;
  stamp?: Stamp;
};

type TimelineItem = Step & { state: StepState; time: string | null };

const STEPS: Step[] = [
  {
    status: 'DISPATCHED',
    label: 'Ambulance dispatched',
    description: 'A driver and ambulance were assigned to the request.',
    stamp: 'dispatchedAt',
  },
  {
    status: 'EN_ROUTE_TO_PICKUP',
    label: 'On the way to pickup',
    description: 'The driver is heading to the pickup address.',
  },
  {
    status: 'PATIENT_PICKED_UP',
    label: 'Patient picked up',
    description: 'The patient is on board the ambulance.',
    stamp: 'pickedUpAt',
  },
  {
    status: 'EN_ROUTE_TO_HOSPITAL',
    label: 'On the way to hospital',
    description: 'The ambulance is heading to the destination hospital.',
  },
  {
    status: 'ARRIVED_AT_HOSPITAL',
    label: 'Arrived at hospital',
    description: 'The patient has been handed over to the hospital.',
    stamp: 'arrivedAt',
  },
  {
    status: 'COMPLETED',
    label: 'Trip completed',
    description: 'Distance recorded and the fare calculated.',
    stamp: 'completedAt',
  },
];

const MARKER_CLASSES: Record<StepState, string> = {
  done: 'border-success bg-success text-success-foreground',
  current: 'border-info bg-info/10 text-info',
  upcoming: 'border-border bg-background',
  cancelled: 'border-destructive bg-destructive text-destructive-foreground',
};

const STATE_LABELS: Record<StepState, string> = {
  done: 'Done',
  current: 'In progress',
  upcoming: 'Not started',
  cancelled: 'Cancelled',
};

const stampOf = (trip: Trip, step: Step): string | null => (step.stamp ? trip[step.stamp] : null);

function buildTimeline(trip: Trip): TimelineItem[] {
  if (trip.status === 'CANCELLED') {
    const lastReached = STEPS.findLastIndex((step) => stampOf(trip, step) !== null);

    return [
      ...STEPS.slice(0, lastReached + 1).map((step) => ({
        ...step,
        state: 'done' as const,
        time: stampOf(trip, step),
      })),
      {
        status: 'CANCELLED',
        label: 'Trip cancelled',
        description: trip.cancelReason ?? 'The trip was cancelled before it finished.',
        state: 'cancelled',
        time: null,
      },
    ];
  }

  const current = STEPS.findIndex((step) => step.status === trip.status);

  return STEPS.map((step, index) => ({
    ...step,
    state:
      index < current || trip.status === 'COMPLETED'
        ? 'done'
        : index === current
          ? 'current'
          : 'upcoming',
    time: stampOf(trip, step),
  }));
}

export function TripTimeline({ trip }: { trip: Trip }) {
  const items = buildTimeline(trip);

  return (
    <ol>
      {items.map((item, index) => (
        <li
          key={item.status}
          aria-current={item.state === 'current' ? 'step' : undefined}
          className="relative flex gap-4 pb-6 last:pb-0"
        >
          {index < items.length - 1 ? (
            <span
              aria-hidden="true"
              className={cn(
                'absolute top-9 bottom-1 left-4 w-0.5 -translate-x-1/2 rounded-full',
                item.state === 'done' ? 'bg-success' : 'bg-border',
              )}
            />
          ) : null}
          <span
            aria-hidden="true"
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full border-2',
              MARKER_CLASSES[item.state],
            )}
          >
            {item.state === 'done' ? <Check className="size-4" /> : null}
            {item.state === 'cancelled' ? <X className="size-4" /> : null}
            {item.state === 'current' ? (
              <span className="size-2.5 rounded-full bg-current motion-safe:animate-pulse" />
            ) : null}
          </span>
          <div className="min-w-0 flex-1 space-y-0.5 pt-1">
            <p className={cn('font-medium', item.state === 'upcoming' && 'text-muted-foreground')}>
              <span className="sr-only">{STATE_LABELS[item.state]}: </span>
              {item.label}
            </p>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            {item.time ? (
              <time dateTime={item.time} className="block text-xs text-muted-foreground">
                {formatDateTime(item.time)}
              </time>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
