export const ROLES = ['PATIENT', 'DRIVER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'BLOCKED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const AMBULANCE_TYPES = ['BASIC', 'AC', 'ICU', 'FREEZER'] as const;
export type AmbulanceType = (typeof AMBULANCE_TYPES)[number];

export const AMBULANCE_STATUSES = ['AVAILABLE', 'ON_TRIP', 'MAINTENANCE'] as const;
export type AmbulanceStatus = (typeof AMBULANCE_STATUSES)[number];

export const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const REQUEST_STATUSES = [
  'PENDING',
  'DISPATCHED',
  'COMPLETED',
  'CANCELLED',
  'NO_AMBULANCE_AVAILABLE',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const TRIP_STATUSES = [
  'DISPATCHED',
  'EN_ROUTE_TO_PICKUP',
  'PATIENT_PICKED_UP',
  'EN_ROUTE_TO_HOSPITAL',
  'ARRIVED_AT_HOSPITAL',
  'COMPLETED',
  'CANCELLED',
] as const;
export type TripStatus = (typeof TRIP_STATUSES)[number];

export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'CANCELLED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const NOTIFICATION_TYPES = ['DISPATCH', 'TRIP_STATUS', 'PAYMENT', 'SYSTEM'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type ApiSuccess<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: Meta;
};

export type ApiErrorSource = {
  path: string;
  message: string;
};

export type ApiFailure = {
  success: false;
  statusCode: number;
  message: string;
  errors?: ApiErrorSource[];
};

export type ApiResult<T> = {
  data: T;
  meta?: Meta;
  message: string;
};
