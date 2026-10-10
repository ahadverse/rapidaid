import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  AmbulanceStatus,
  AmbulanceType,
  NotificationType,
  PaymentStatus,
  Priority,
  RequestStatus,
  Role,
  TripStatus,
  UserStatus,
} from '@/lib/api/types';

export type StatusValue =
  | AmbulanceStatus
  | AmbulanceType
  | NotificationType
  | PaymentStatus
  | Priority
  | RequestStatus
  | Role
  | TripStatus
  | UserStatus
  | 'UNPAID';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-success/10 text-success dark:bg-success/20',
  warning: 'bg-warning/10 text-warning dark:bg-warning/20',
  danger: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
  info: 'bg-info/10 text-info dark:bg-info/20',
  neutral: 'bg-muted text-muted-foreground',
};

// Values shared across enums (PENDING, DISPATCHED, COMPLETED, CANCELLED) mean the same thing
// everywhere, so one flat map is enough.
const TONES: Record<StatusValue, Tone> = {
  PENDING: 'warning',
  DISPATCHED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
  NO_AMBULANCE_AVAILABLE: 'danger',
  EN_ROUTE_TO_PICKUP: 'info',
  PATIENT_PICKED_UP: 'info',
  EN_ROUTE_TO_HOSPITAL: 'info',
  ARRIVED_AT_HOSPITAL: 'success',
  PAID: 'success',
  UNPAID: 'warning',
  FAILED: 'danger',
  AVAILABLE: 'success',
  ON_TRIP: 'info',
  MAINTENANCE: 'warning',
  ACTIVE: 'success',
  BLOCKED: 'danger',
  CRITICAL: 'danger',
  HIGH: 'warning',
  MEDIUM: 'info',
  LOW: 'neutral',
  PATIENT: 'neutral',
  DRIVER: 'neutral',
  ADMIN: 'neutral',
  BASIC: 'neutral',
  AC: 'neutral',
  ICU: 'neutral',
  FREEZER: 'neutral',
  DISPATCH: 'info',
  TRIP_STATUS: 'info',
  PAYMENT: 'success',
  SYSTEM: 'neutral',
};

const ACRONYMS = new Set<StatusValue>(['AC', 'ICU']);

export function formatStatus(value: StatusValue): string {
  if (ACRONYMS.has(value)) {
    return value;
  }

  const text = value.toLowerCase().replaceAll('_', ' ');

  return text.charAt(0).toUpperCase() + text.slice(1);
}

type StatusBadgeProps = {
  value: StatusValue;
  className?: string;
};

export function StatusBadge({ value, className }: StatusBadgeProps) {
  return <Badge className={cn(TONE_CLASSES[TONES[value]], className)}>{formatStatus(value)}</Badge>;
}
