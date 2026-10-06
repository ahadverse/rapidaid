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

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
};

export type Payment = {
  id: string;
  amount: number | string;
  status: PaymentStatus;
  transactionId: string;
  gateway: string;
  paidAt: string | null;
  createdAt: string;
  trip: {
    id: string;
    status: TripStatus;
    distanceKm: number | string | null;
    fare: number | string | null;
    completedAt: string | null;
    hospital: { id: string; name: string; area: string } | null;
  };
};

export type PaymentSession = Payment & { gatewayPageURL: string; sessionKey: string | null };

export type EmergencyRequest = {
  id: string;
  pickupAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  patientCondition: string;
  priority: Priority;
  status: RequestStatus;
  requestedAmbulanceType: AmbulanceType | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Trip = {
  id: string;
  status: TripStatus;
  distanceKm: number | string | null;
  fare: number | string | null;
  cancelReason: string | null;
  dispatchedAt: string;
  pickedUpAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  ambulance: {
    id: string;
    regNumber: string;
    type: AmbulanceType;
    status: AmbulanceStatus;
    stationArea: string;
  };
  driver: {
    id: string;
    licenseNumber: string;
    user: { id: string; name: string; phone: string | null };
  };
  hospital: { id: string; name: string; area: string; phone: string } | null;
  request: {
    id: string;
    pickupAddress: string;
    patientCondition: string;
    priority: Priority;
    status: RequestStatus;
    patient: { id: string; name: string; phone: string | null };
  };
};

export type Hospital = {
  id: string;
  name: string;
  address: string;
  area: string;
  phone: string;
  specializations: string[];
  availableBeds: number;
};

export type DriverProfile = {
  id: string;
  licenseNumber: string;
  isAvailable: boolean;
  user: { id: string; name: string; email: string; phone: string | null; status: UserStatus };
  ambulance: {
    id: string;
    regNumber: string;
    type: AmbulanceType;
    status: AmbulanceStatus;
  } | null;
};

export type DashboardStats = {
  users: { total: number; blocked: number; byRole: Record<Role, number> };
  ambulances: { total: number; byStatus: Record<AmbulanceStatus, number> };
  hospitals: { total: number };
  emergencyRequests: {
    total: number;
    byStatus: Record<RequestStatus, number>;
    byPriority: Record<Priority, number>;
  };
  trips: {
    total: number;
    active: number;
    dispatchedToday: number;
    byStatus: Record<TripStatus, number>;
    averageFare: string;
    averageDistanceKm: string;
  };
  revenue: {
    collected: string;
    paidPayments: number;
    outstanding: string;
    pendingPayments: number;
  };
  generatedAt: string;
};

export type DailyTripRow = { date: string; trips: number; revenue: number };

export type TripReport = {
  range: { from: string; to: string };
  trips: {
    byStatus: Partial<Record<TripStatus, number>>;
    completed: number;
    cancelled: number;
    totalDistanceKm: string;
    averageDistanceKm: string;
    averageFare: string;
  };
  emergencyRequests: { byPriority: Partial<Record<Priority, number>> };
  revenue: { billed: string; collected: string; paidPayments: number };
  topHospitals: { id: string; name: string; area: string; trips: number }[];
  daily: DailyTripRow[];
};

export type QueuedRequest = EmergencyRequest & {
  patient: { id: string; name: string; email: string; phone: string | null };
};

export type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: Role } | null;
};

export type AmbulanceRecord = {
  id: string;
  regNumber: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  baseFare: number | string;
  perKmRate: number | string;
  stationArea: string;
  createdAt: string;
};
