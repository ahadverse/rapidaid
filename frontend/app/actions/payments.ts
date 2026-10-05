'use server';

import type { ActionResult } from '@/lib/api/action-result';
import { authedAction } from '@/lib/api/authed';
import type { Payment, PaymentSession, PaymentStatus } from '@/lib/api/types';

export async function listMyPaymentsAction(query: {
  page: number;
  limit: number;
  status?: PaymentStatus;
}): Promise<ActionResult<Payment[]>> {
  return authedAction<Payment[]>('/payments/me', {
    query: { ...query, sortBy: 'createdAt', sortOrder: 'desc' },
  });
}

export async function initPaymentAction(tripId: string): Promise<ActionResult<PaymentSession>> {
  return authedAction<PaymentSession>(`/payments/init/${encodeURIComponent(tripId)}`, {
    method: 'POST',
  });
}
