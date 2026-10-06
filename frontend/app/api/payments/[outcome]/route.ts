import { NextResponse, type NextRequest } from 'next/server';
import { api } from '@/lib/api/client';
import { env } from '@/lib/env';
import type { Payment } from '@/lib/api/types';

const OUTCOMES = ['success', 'fail', 'cancel'] as const;

type Outcome = (typeof OUTCOMES)[number];

const isOutcome = (value: string): value is Outcome => OUTCOMES.some((item) => item === value);

// The gateway posts the browser here; the payload goes on to the API, which validates it with the gateway.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ outcome: string }> },
) {
  const { outcome } = await params;

  if (!isOutcome(outcome)) {
    return NextResponse.json({ message: 'Unknown payment outcome' }, { status: 404 });
  }

  const form = await request.formData();
  const payload = Object.fromEntries(
    [...form.entries()].filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );

  const destination = new URL(`/payment/${outcome}`, env.appUrl);

  try {
    const { data } = await api<Payment>(`/payments/${outcome}`, { method: 'POST', body: payload });
    destination.searchParams.set('paymentId', data.id);
  } catch {
    if (outcome === 'success') {
      destination.pathname = '/payment/fail';
    }
  }

  return NextResponse.redirect(destination, 303);
}
