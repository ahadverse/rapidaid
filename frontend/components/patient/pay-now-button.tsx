'use client';

import { useMutation } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { initPaymentAction } from '@/app/actions/payments';
import { Button } from '@/components/ui/button';
import { unwrap } from '@/lib/api/action-result';

export function PayNowButton({ tripId, label = 'Pay now' }: { tripId: string; label?: string }) {
  const pay = useMutation({
    mutationFn: async () => unwrap(await initPaymentAction(tripId)).data,
    onSuccess: ({ gatewayPageURL }) => {
      window.location.assign(gatewayPageURL);
    },
  });

  return (
    <Button size="sm" disabled={pay.isPending || pay.isSuccess} onClick={() => pay.mutate()}>
      <CreditCard aria-hidden="true" />
      {pay.isPending || pay.isSuccess ? 'Redirecting...' : label}
    </Button>
  );
}
