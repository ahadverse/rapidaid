import { PaymentStatus } from '@prisma/client';

export const PAYMENT_CURRENCY = 'BDT';

export const SSL_REQUEST_TIMEOUT_MS = 15000;

// PAID is terminal — a second attempt on a settled trip is a double charge.
export const RETRIABLE_PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.PENDING,
  PaymentStatus.FAILED,
  PaymentStatus.CANCELLED,
];

export const DEFAULT_BILLING_CITY = 'Dhaka';

export const paymentSelect = {
  id: true,
  amount: true,
  status: true,
  transactionId: true,
  gateway: true,
  paidAt: true,
  createdAt: true,
  trip: {
    select: {
      id: true,
      status: true,
      distanceKm: true,
      fare: true,
      completedAt: true,
      hospital: { select: { id: true, name: true, area: true } },
    },
  },
} as const;
